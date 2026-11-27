-- When a family's last parent login is deleted, delete the family too.
--
-- Without this, deleting a parent's login left an empty family behind, and any athletes,
-- numbers and consent records in it would have no one able to see or remove them.
-- Deleting the family cascades to everything in it (athletes, sports, stat entries,
-- consents, subscription row). Athlete logins are separate users and are removed by the app.

create function private.remove_family_without_guardians()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.guardians g where g.family_id = old.family_id) then
    delete from public.families f where f.id = old.family_id;
  end if;
  return null;
end;
$$;

revoke execute on function private.remove_family_without_guardians() from public;

create trigger guardians_remove_empty_family
  after delete on public.guardians
  for each row execute function private.remove_family_without_guardians();
