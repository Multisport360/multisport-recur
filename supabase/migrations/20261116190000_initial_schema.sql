-- Multi-Sport Recur: tables.
-- Row-level security is switched on for every table in the next migration.
--
-- Data rules from CLAUDE.md that this file enforces in the database itself:
--   * birth YEAR only, never a full birth date; no addresses, school IDs or photos
--   * no athlete row can be saved before a consent record exists
--   * athletes under 13 can never have a login
--   * stat entries are never overwritten: every entry is a new row

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Benchmarks (public reference data, loaded from data/benchmarks.csv)
-- ---------------------------------------------------------------------------

create table public.sources (
  id text primary key,
  name text not null check (char_length(name) > 0),
  url text not null check (url ~ '^https?://')
);

create table public.benchmarks (
  id bigint generated always as identity primary key,
  sport text not null check (sport in ('Baseball', 'Football', 'Track & Field')),
  position_or_event text not null check (char_length(position_or_event) > 0),
  gender text not null check (gender in ('Male', 'Female')),
  metric text not null check (char_length(metric) > 0),
  unit text not null check (unit in ('mph', 'sec', 'in', 'lb')),
  better text not null check (better in ('higher', 'lower', 'range')),
  level text not null check (char_length(level) > 0),
  level_code text not null,
  entry numeric not null check (entry > 0),
  mid numeric check (mid > 0),
  elite numeric check (elite > 0),
  confidence text not null check (confidence in ('Low', 'Medium', 'Medium-High', 'High')),
  notes text not null default '',
  source_id text not null references public.sources (id),
  unique (sport, position_or_event, gender, metric, level_code, source_id)
);

create index benchmarks_lookup_idx on public.benchmarks (sport, position_or_event, gender, metric);

-- ---------------------------------------------------------------------------
-- Families, guardians, athletes
-- ---------------------------------------------------------------------------

create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- A guardian is a parent's login. One login belongs to exactly one family.
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index guardians_family_idx on public.guardians (family_id);

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 40),
  grad_year integer not null check (grad_year between 2020 and 2100),
  -- Year only. Never a full birth date.
  birth_year integer not null check (birth_year between 1990 and 2100),
  height_in numeric check (height_in between 36 and 96),
  weight_lb numeric check (weight_lb between 50 and 450),
  gender text not null check (gender in ('Male', 'Female')),
  -- The athlete's own login. Stays null for athletes under 13.
  login_user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index athletes_family_idx on public.athletes (family_id);

-- A parent's consent. It is written BEFORE the athlete (athlete_id is null),
-- then tied to the athlete when the athlete row is saved. One consent covers one athlete.
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  guardian_id uuid not null references public.guardians (id) on delete cascade,
  athlete_id uuid unique references public.athletes (id) on delete cascade,
  consent_version text not null check (char_length(consent_version) > 0),
  method text not null check (char_length(method) > 0),
  accepted_at timestamptz not null default now()
);

create index consents_family_idx on public.consents (family_id);

create table public.athlete_sports (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  sport text not null check (sport in ('Baseball', 'Football', 'Track & Field')),
  position_or_event text not null check (char_length(position_or_event) > 0),
  created_at timestamptz not null default now(),
  unique (athlete_id, sport, position_or_event)
);

-- Never overwritten. A new measurement is a new row.
create table public.stat_entries (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  sport text not null check (sport in ('Baseball', 'Football', 'Track & Field')),
  metric text not null check (char_length(metric) > 0),
  value numeric not null check (value > 0 and value < 100000),
  unit text not null check (unit in ('mph', 'sec', 'in', 'lb')),
  measured_on date not null check (measured_on >= date '2015-01-01'),
  how_measured text not null check (how_measured in ('self', 'coach', 'event')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index stat_entries_athlete_idx on public.stat_entries (athlete_id, sport, metric, measured_on);

-- ---------------------------------------------------------------------------
-- Billing and training plans
-- ---------------------------------------------------------------------------

-- One row per family, kept in step with Stripe by the server. Parents can read it, never write it.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families (id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null,
  price_cents integer check (price_cents >= 0),
  billing_interval text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  -- The period end a renewal reminder was last sent for, so it is sent once per period.
  renewal_reminder_sent_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Training plans come ONLY from these coach-reviewed templates. Nothing generates one.
create table public.plan_templates (
  id uuid primary key default gen_random_uuid(),
  sport text not null check (sport in ('Baseball', 'Football', 'Track & Field')),
  position_or_event text,
  metric text,
  min_grade integer not null default 8 check (min_grade between 8 and 12),
  max_grade integer not null default 12 check (max_grade between 8 and 12),
  title text not null check (char_length(title) > 0),
  summary text not null default '',
  -- The plan itself, as the coach wrote it: [{ "heading": "...", "items": ["..."] }]
  body jsonb not null default '[]'::jsonb,
  -- Shown on every plan.
  safety_notes text not null check (char_length(safety_notes) > 0),
  reviewed_by text,
  reviewed_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check (min_grade <= max_grade),
  -- A template cannot be published until a coach has reviewed it.
  check (not is_published or (reviewed_by is not null and reviewed_at is not null))
);

-- ---------------------------------------------------------------------------
-- Rules enforced by triggers
-- ---------------------------------------------------------------------------

-- No athlete data is saved before a consent record exists.
-- An athlete insert must find an unused consent for the family, and claims it.
-- If there is none, the insert fails and nothing is saved.
create function private.claim_consent_for_athlete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  unused_consent uuid;
begin
  select c.id
    into unused_consent
    from public.consents c
   where c.family_id = new.family_id
     and c.athlete_id is null
   order by c.accepted_at desc
   limit 1
     for update;

  if unused_consent is null then
    raise exception 'consent_required: a parent consent record is needed before an athlete can be saved'
      using errcode = 'P0001';
  end if;

  update public.consents set athlete_id = new.id where id = unused_consent;
  return null;
end;
$$;

create trigger athletes_claim_consent
  after insert on public.athletes
  for each row execute function private.claim_consent_for_athlete();

-- A consent record is evidence. Once written, the only change allowed is tying it to its athlete.
create function private.protect_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.athlete_id is not null
     or new.athlete_id is null
     or new.family_id is distinct from old.family_id
     or new.guardian_id is distinct from old.guardian_id
     or new.consent_version is distinct from old.consent_version
     or new.method is distinct from old.method
     or new.accepted_at is distinct from old.accepted_at then
    raise exception 'consent_locked: consent records cannot be changed' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger consents_protect
  before update on public.consents
  for each row execute function private.protect_consent();

-- Athletes under 13 never get a login.
-- Only the birth year is stored, so the check assumes the birthday has not happened yet
-- this year: a login is allowed only when (this year - birth year) is 14 or more.
create function private.guard_athlete_login()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  min_years constant integer := 14;
begin
  if new.login_user_id is null then
    return new;
  end if;

  if extract(year from now())::integer - new.birth_year < min_years then
    raise exception 'login_under_13: athletes under 13 cannot have a login' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.guardians g where g.user_id = new.login_user_id) then
    raise exception 'login_is_guardian: a parent login cannot also be an athlete login' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger athletes_guard_login
  before insert or update of login_user_id, birth_year on public.athletes
  for each row execute function private.guard_athlete_login();

-- Stat entries are never overwritten.
create function private.block_stat_entry_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'stat_entry_locked: stat entries are never changed; add a new entry instead'
    using errcode = 'P0001';
end;
$$;

create trigger stat_entries_block_update
  before update on public.stat_entries
  for each row execute function private.block_stat_entry_update();

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function private.touch_updated_at();
