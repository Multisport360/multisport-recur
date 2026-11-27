-- Each family's time zone, so dates and the Monday that starts a 6-week training block are the
-- family's own calendar days. Taken from the parent's browser at sign-up. Families that already
-- exist get America/New_York.

-- True for a time zone name Postgres knows (the IANA names browsers give, plus UTC).
create function private.is_time_zone(name text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select name is not null
    and length(name) between 1 and 64
    and exists (select 1 from pg_catalog.pg_timezone_names where pg_timezone_names.name = is_time_zone.name);
$$;

alter table public.families
  add column timezone text not null default 'America/New_York'
  constraint families_timezone_is_known check (private.is_time_zone(timezone));

-- ensure_family() now saves the time zone the sign-up form put in the parent's user metadata.
-- That metadata can be edited by its owner, so an unknown name falls back to America/New_York.
create or replace function public.ensure_family()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  existing_family uuid;
  new_family uuid;
  browser_zone text := (select auth.jwt()) -> 'user_metadata' ->> 'timezone';
begin
  if caller is null then
    raise exception 'not_signed_in: sign in first' using errcode = 'P0001';
  end if;

  select g.family_id into existing_family from public.guardians g where g.user_id = caller;
  if existing_family is not null then
    return existing_family;
  end if;

  -- Athlete logins are marked by the server in app_metadata (users cannot edit it).
  -- The mark still applies if the athlete row was later removed.
  if exists (select 1 from public.athletes a where a.login_user_id = caller)
     or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'athlete' then
    raise exception 'athlete_login: an athlete login cannot create a family' using errcode = 'P0001';
  end if;

  insert into public.families (timezone)
    values (case when private.is_time_zone(browser_zone) then browser_zone else 'America/New_York' end)
    returning id into new_family;
  insert into public.guardians (family_id, user_id) values (new_family, caller);
  return new_family;
end;
$$;

revoke execute on function public.ensure_family() from public, anon;
grant execute on function public.ensure_family() to authenticated;
