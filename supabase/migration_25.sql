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

  if n <> 25 or exists (select 1 from participants where not ready) then
    return null;
  end if;

  for i in 1..n loop
    insert into assignments (giver_id, receiver_id) values (ids[i], ids[i % n + 1]);
  end loop;

  update draw_state set status = 'drawn', drawn_at = now() where id = 1;
  return null;
end $$;

drop policy "participants insert own" on public.participants;

create policy "participants insert own" on public.participants
  for insert to authenticated
  with check (
    id = auth.uid()
    and ready = false
    and (select count(*) from public.participants) < 25
    and exists (select 1 from public.draw_state where status = 'open')
  );
