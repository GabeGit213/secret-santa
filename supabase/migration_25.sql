alter table public.draw_state
  add column if not exists target_count int not null default 25
  constraint draw_state_target_count_check check (target_count between 3 and 100);

drop policy "participants insert own" on public.participants;

create policy "participants insert own" on public.participants
  for insert to authenticated
  with check (
    id = auth.uid()
    and ready = false
    and (select count(*) from public.participants) < (select target_count from public.draw_state where id = 1)
    and exists (select 1 from public.draw_state where status = 'open')
  );

create or replace function public.run_draw_if_ready()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ids uuid[];
  n int;
  i int;
  target_count int;
begin
  perform 1 from draw_state where id = 1 and status = 'open' for update;
  if not found then return null; end if;

  select ds.target_count into target_count
  from public.draw_state ds
  where ds.id = 1;

  select array_agg(id order by random()) into ids from participants;
  n := coalesce(cardinality(ids), 0);

  if n <> target_count or exists (select 1 from participants where not ready) then
    return null;
  end if;

  for i in 1..n loop
    insert into assignments (giver_id, receiver_id) values (ids[i], ids[i % n + 1]);
  end loop;

  update draw_state set status = 'drawn', drawn_at = now() where id = 1;
  return null;
end $$;

create or replace function public.admin_set_target(pin text, target_count int)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (
    select 1
    from public.app_secrets
    where key = 'reset_pin_hash'
      and extensions.crypt(pin, value) = value
  ) then
    raise exception using message = 'wrong_pin';
  end if;
  if target_count < 3 or target_count > 100 then
    raise exception using message = 'invalid_target';
  end if;
  update public.draw_state set target_count = $2 where id = 1;
end $$;

revoke all on function public.admin_set_target(text, int) from public, anon;
grant execute on function public.admin_set_target(text, int) to authenticated;
