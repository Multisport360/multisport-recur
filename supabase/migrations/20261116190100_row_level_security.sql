-- Multi-Sport Recur: row-level security on EVERY table.
--
-- Who can see what:
--   * anyone (even signed out): benchmarks and their sources. Read only.
--   * a guardian (parent login): only their own family's rows.
--   * an athlete login: only its own athlete row and that athlete's sports and stats.
--   * the server (service role): everything. Used for Stripe sync, invites and seeding.
--
-- Table privileges are granted column by column where it matters, so a signed-in user
-- cannot set fields the server owns (login_user_id, accepted_at, anything on subscriptions).

-- ---------------------------------------------------------------------------
-- Helper functions. They live in the private schema, which the API does not expose.
-- security definer lets a policy look up the caller's family without recursing into RLS.
-- ---------------------------------------------------------------------------

create function private.guardian_family_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select g.family_id from public.guardians g where g.user_id = (select auth.uid());
$$;

create function private.guardian_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select g.id from public.guardians g where g.user_id = (select auth.uid());
$$;

create function private.login_athlete_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.id from public.athletes a where a.login_user_id = (select auth.uid());
$$;

create function private.login_athlete_family_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.family_id from public.athletes a where a.login_user_id = (select auth.uid());
$$;

-- True when the athlete is in the caller's family (guardian) or IS the caller (athlete login).
create function private.can_access_athlete(target_athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.athletes a
     where a.id = target_athlete
       and (
         a.family_id = (select g.family_id from public.guardians g where g.user_id = (select auth.uid()))
         or a.login_user_id = (select auth.uid())
       )
  );
$$;

-- True when the athlete is in the caller's family and the caller is a guardian.
create function private.is_guardian_of_athlete(target_athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.athletes a
      join public.guardians g on g.family_id = a.family_id
     where a.id = target_athlete
       and g.user_id = (select auth.uid())
  );
$$;

create function private.family_has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.subscriptions s
     where s.family_id = coalesce(private.guardian_family_id(), private.login_athlete_family_id())
       and s.status in ('active', 'trialing')
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
revoke execute on function
  private.guardian_family_id(),
  private.guardian_id(),
  private.login_athlete_id(),
  private.login_athlete_family_id(),
  private.can_access_athlete(uuid),
  private.is_guardian_of_athlete(uuid),
  private.family_has_active_subscription(),
  private.claim_consent_for_athlete(),
  private.protect_consent(),
  private.guard_athlete_login(),
  private.block_stat_entry_update(),
  private.touch_updated_at()
from public;
grant execute on function
  private.guardian_family_id(),
  private.guardian_id(),
  private.login_athlete_id(),
  private.login_athlete_family_id(),
  private.can_access_athlete(uuid),
  private.is_guardian_of_athlete(uuid),
  private.family_has_active_subscription()
to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Creating a family. A new parent login calls this once; it makes the family and
-- the guardian row together. An athlete login can never become a guardian.
-- ---------------------------------------------------------------------------

create function public.ensure_family()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  existing_family uuid;
  new_family uuid;
begin
  if caller is null then
    raise exception 'not_signed_in: sign in first' using errcode = 'P0001';
  end if;

  select g.family_id into existing_family from public.guardians g where g.user_id = caller;
  if existing_family is not null then
    return existing_family;
  end if;

  if exists (select 1 from public.athletes a where a.login_user_id = caller) then
    raise exception 'athlete_login: an athlete login cannot create a family' using errcode = 'P0001';
  end if;

  insert into public.families default values returning id into new_family;
  insert into public.guardians (family_id, user_id) values (new_family, caller);
  return new_family;
end;
$$;

revoke execute on function public.ensure_family() from public, anon;
grant execute on function public.ensure_family() to authenticated;

-- ---------------------------------------------------------------------------
-- Switch RLS on. With no policy, a table returns nothing and accepts nothing.
-- ---------------------------------------------------------------------------

alter table public.sources enable row level security;
alter table public.benchmarks enable row level security;
alter table public.families enable row level security;
alter table public.guardians enable row level security;
alter table public.consents enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_sports enable row level security;
alter table public.stat_entries enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plan_templates enable row level security;

-- ---------------------------------------------------------------------------
-- Table privileges. Start from nothing, then grant exactly what each role needs.
-- ---------------------------------------------------------------------------

revoke all on table
  public.sources, public.benchmarks, public.families, public.guardians, public.consents,
  public.athletes, public.athlete_sports, public.stat_entries, public.subscriptions, public.plan_templates
from public, anon, authenticated;

grant all on table
  public.sources, public.benchmarks, public.families, public.guardians, public.consents,
  public.athletes, public.athlete_sports, public.stat_entries, public.subscriptions, public.plan_templates
to service_role;

grant select on table public.sources, public.benchmarks to anon, authenticated;

grant select on table public.families, public.guardians, public.subscriptions, public.plan_templates to authenticated;

grant select on table public.consents to authenticated;
grant insert (family_id, guardian_id, consent_version, method) on table public.consents to authenticated;

grant select, delete on table public.athletes to authenticated;
grant insert (family_id, first_name, grad_year, birth_year, height_in, weight_lb, gender)
  on table public.athletes to authenticated;
grant update (first_name, grad_year, birth_year, height_in, weight_lb, gender)
  on table public.athletes to authenticated;

grant select, delete on table public.athlete_sports to authenticated;
grant insert (athlete_id, sport, position_or_event) on table public.athlete_sports to authenticated;

grant select on table public.stat_entries to authenticated;
grant insert (athlete_id, sport, metric, value, unit, measured_on, how_measured)
  on table public.stat_entries to authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

-- Benchmarks: public, read only. Only the server (admin) can change them.
create policy "Anyone can read sources" on public.sources
  for select to anon, authenticated using (true);

create policy "Anyone can read benchmarks" on public.benchmarks
  for select to anon, authenticated using (true);

-- Families
create policy "Family members can read their family" on public.families
  for select to authenticated
  using (
    id = (select private.guardian_family_id())
    or id = (select private.login_athlete_family_id())
  );

-- Guardians
create policy "Guardians can read guardians in their family" on public.guardians
  for select to authenticated
  using (family_id = (select private.guardian_family_id()));

-- Consents: a guardian can read their family's and add their own. No edits, no deletes.
create policy "Guardians can read their family's consents" on public.consents
  for select to authenticated
  using (family_id = (select private.guardian_family_id()));

create policy "Guardians can record their own consent" on public.consents
  for insert to authenticated
  with check (
    family_id = (select private.guardian_family_id())
    and guardian_id = (select private.guardian_id())
  );

-- Athletes
create policy "Guardians can read their family's athletes" on public.athletes
  for select to authenticated
  using (family_id = (select private.guardian_family_id()));

create policy "An athlete login can read its own athlete" on public.athletes
  for select to authenticated
  using (login_user_id = (select auth.uid()));

create policy "Guardians can add athletes to their family" on public.athletes
  for insert to authenticated
  with check (family_id = (select private.guardian_family_id()));

create policy "Guardians can update their family's athletes" on public.athletes
  for update to authenticated
  using (family_id = (select private.guardian_family_id()))
  with check (family_id = (select private.guardian_family_id()));

create policy "Guardians can remove their family's athletes" on public.athletes
  for delete to authenticated
  using (family_id = (select private.guardian_family_id()));

-- Athlete sports
create policy "Family can read an athlete's sports" on public.athlete_sports
  for select to authenticated
  using ((select private.can_access_athlete(athlete_id)));

create policy "Family can add an athlete's sports" on public.athlete_sports
  for insert to authenticated
  with check ((select private.can_access_athlete(athlete_id)));

create policy "Guardians can remove an athlete's sports" on public.athlete_sports
  for delete to authenticated
  using ((select private.is_guardian_of_athlete(athlete_id)));

-- Stat entries: read and add only. There is no update or delete policy on purpose.
create policy "Family can read an athlete's stats" on public.stat_entries
  for select to authenticated
  using ((select private.can_access_athlete(athlete_id)));

create policy "Family can add an athlete's stats" on public.stat_entries
  for insert to authenticated
  with check ((select private.can_access_athlete(athlete_id)));

-- Subscriptions: the family can read its own. Only the server writes.
create policy "Family can read its subscription" on public.subscriptions
  for select to authenticated
  using (
    family_id = (select private.guardian_family_id())
    or family_id = (select private.login_athlete_family_id())
  );

-- Plan templates: published templates, for families with an active subscription.
create policy "Subscribers can read published plan templates" on public.plan_templates
  for select to authenticated
  using (is_published and (select private.family_has_active_subscription()));
