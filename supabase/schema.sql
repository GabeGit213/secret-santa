create extension if not exists pgcrypto with schema extensions;

create or replace function public.valid_subjects(s text[])
returns boolean language sql immutable as $$
  select s is not null
     and cardinality(s) between 2 and 3
     and (select count(distinct x) from unnest(s) x) = cardinality(s)
     and not exists (select 1 from unnest(s) x where x !~ '^[a-z_]{2,30}$');
$$;

create table public.participants (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  subjects text[] not null check (public.valid_subjects(subjects)),
  ready boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index participants_name_unique on public.participants (lower(btrim(name)));

create table public.draw_state (
  id int primary key default 1 check (id = 1),
  status text not null default 'open' check (status in ('open', 'drawn')),
  drawn_at timestamptz
);
insert into public.draw_state (id) values (1);

create table public.assignments (
  giver_id uuid primary key references public.participants(id) on delete cascade,
  receiver_id uuid not null unique references public.participants(id) on delete cascade,
  check (giver_id <> receiver_id)
);

create table public.app_secrets (
  key text primary key,
  value text not null
);

alter table public.participants enable row level security;
alter table public.draw_state enable row level security;
alter table public.assignments enable row level security;
alter table public.app_secrets enable row level security;

create policy "participants read" on public.participants
  for select to authenticated using (true);

create policy "participants insert own" on public.participants
  for insert to authenticated
  with check (
    id = auth.uid()
    and ready = false
    and exists (select 1 from public.draw_state where status = 'open')
  );

create policy "participants update own" on public.participants
  for update to authenticated
  using (
    id = auth.uid()
    and ready = false
    and exists (select 1 from public.draw_state where status = 'open')
  )
  with check (id = auth.uid());

create policy "draw_state read" on public.draw_state
  for select to authenticated using (true);

create policy "assignments read own" on public.assignments
  for select to authenticated using (giver_id = auth.uid());

create or replace function public.run_draw_if_ready()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ids uuid[];
  n int;
  i int;
begin
  perform 1 from draw_state where id = 1 and status = 'open' for update;
  if not found then return null; end if;

  select array_agg(id order by random()) into ids from participants;
  n := coalesce(cardinality(ids), 0);

  if n < 3 or exists (select 1 from participants where not ready) then
    return null;
  end if;

  for i in 1..n loop
    insert into assignments (giver_id, receiver_id) values (ids[i], ids[i % n + 1]);
  end loop;

  update draw_state set status = 'drawn', drawn_at = now() where id = 1;
  return null;
end $$;

create trigger participants_ready_draw
  after update of ready on public.participants
  for each statement execute function public.run_draw_if_ready();

-- IMPORTANT: replace CHANGE_ME with a real PIN/passphrase BEFORE running this file
insert into public.app_secrets (key, value)
values ('reset_pin_hash', extensions.crypt('CHANGE_ME', extensions.gen_salt('bf')));

create or replace function public.admin_reset(pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  stored_hash text;
begin
  select app_secrets.value
    into stored_hash
    from public.app_secrets
   where app_secrets.key = 'reset_pin_hash';

  if stored_hash is null or extensions.crypt(pin, stored_hash) <> stored_hash then
    raise exception using message = 'wrong_pin';
  end if;
  delete from public.assignments where true;
  delete from public.participants where true;
  update public.draw_state set status = 'open', drawn_at = null where id = 1;
end $$;

revoke all on function public.admin_reset(text) from public, anon;
grant execute on function public.admin_reset(text) to authenticated;

alter publication supabase_realtime add table public.participants, public.draw_state;
