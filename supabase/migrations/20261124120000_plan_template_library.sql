-- Training plans from a coach-reviewed template library.
--
-- plan_templates changes from "one hand-written plan per sport" (never filled in) to
-- "one versioned template library per row" (data/plan_templates.draft.json, stored as JSONB).
-- The plan builder in src/lib/plan picks and arranges items from it. Nothing generates a plan.
--
--   review_status 'draft'    : never readable by families. Only the server can read it, and the
--                               app only shows it in local development with ALLOW_DRAFT_PLANS=true.
--   review_status 'approved' : readable by families with an active subscription. Needs
--                               reviewed_by and reviewed_on (the strength coach's sign-off).
--
-- Going live after the coach signs off is one change:
--   update public.plan_templates
--      set review_status = 'approved', reviewed_by = '<coach name, CSCS>', reviewed_on = '<date>'
--    where version = '<version>';
--
-- Also adds the parent's answers to the plan safety screens and the "session done" marks.

-- ---------------------------------------------------------------------------
-- plan_templates: reshape. Refuse if it holds anything, so no plan is ever dropped.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from public.plan_templates) then
    raise exception 'plan_templates is not empty. Export its rows and clear it before running this migration.';
  end if;
end;
$$;

drop policy "Subscribers can read published plan templates" on public.plan_templates;

alter table public.plan_templates
  drop constraint if exists plan_templates_check,
  drop constraint if exists plan_templates_check1,
  drop column sport,
  drop column position_or_event,
  drop column metric,
  drop column min_grade,
  drop column max_grade,
  drop column title,
  drop column summary,
  drop column body,
  drop column safety_notes,
  drop column reviewed_at,
  drop column is_published;

alter table public.plan_templates
  add column version text not null unique check (char_length(btrim(version)) > 0),
  add column review_status text not null default 'draft' check (review_status in ('draft', 'approved')),
  add column reviewed_on date,
  -- The whole template library, checked with zod by the seed script and again when the app reads it.
  add column content jsonb not null check (jsonb_typeof(content) = 'object'),
  add column updated_at timestamptz not null default now(),
  add constraint plan_templates_approved_needs_review check (
    review_status <> 'approved'
    or (reviewed_by is not null and char_length(btrim(reviewed_by)) > 0 and reviewed_on is not null)
  );

create trigger plan_templates_touch_updated_at
  before update on public.plan_templates
  for each row execute function private.touch_updated_at();

-- Only approved templates, and only for families who pay. Drafts are invisible to every signed-in user.
create policy "Subscribers can read approved plan templates" on public.plan_templates
  for select to authenticated
  using (review_status = 'approved' and (select private.family_has_active_subscription()));

-- ---------------------------------------------------------------------------
-- plan_screen_answers: the four safety questions, answered by a parent.
-- Never overwritten: changing an answer adds a new row, and the newest row counts.
-- The first row's answered_at is when the athlete's training blocks start.
-- ---------------------------------------------------------------------------

create table public.plan_screen_answers (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  pain_now boolean not null,
  -- Baseball only. Null when the athlete plays no baseball, so the question was not asked.
  throwing_arm_pain boolean,
  has_training_age boolean not null,
  season_phase text not null check (season_phase in ('off_season', 'pre_season', 'in_season', 'rest_period')),
  answered_by uuid default auth.uid() references auth.users (id) on delete set null,
  answered_at timestamptz not null default now()
);

create index plan_screen_answers_athlete_idx on public.plan_screen_answers (athlete_id, answered_at);

-- ---------------------------------------------------------------------------
-- plan_session_completions: "Mark this session done", per athlete.
-- One row per session; unticking deletes the row.
-- ---------------------------------------------------------------------------

create table public.plan_session_completions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  -- The Monday the 6-week block started.
  block_start date not null,
  week integer not null check (week between 1 and 6),
  -- 0 = Monday ... 6 = Sunday
  day integer not null check (day between 0 and 6),
  completed_by uuid default auth.uid() references auth.users (id) on delete set null,
  completed_at timestamptz not null default now(),
  unique (athlete_id, block_start, week, day)
);

-- ---------------------------------------------------------------------------
-- Privileges and row-level security
-- ---------------------------------------------------------------------------

alter table public.plan_screen_answers enable row level security;
alter table public.plan_session_completions enable row level security;

revoke all on table public.plan_screen_answers, public.plan_session_completions from public, anon, authenticated;
grant all on table public.plan_screen_answers, public.plan_session_completions to service_role;

grant select on table public.plan_screen_answers to authenticated;
grant insert (athlete_id, pain_now, throwing_arm_pain, has_training_age, season_phase)
  on table public.plan_screen_answers to authenticated;

grant select, delete on table public.plan_session_completions to authenticated;
grant insert (athlete_id, block_start, week, day) on table public.plan_session_completions to authenticated;

-- Screens: the family can read them; only a parent of the athlete answers them.
create policy "Family can read an athlete's plan screens" on public.plan_screen_answers
  for select to authenticated
  using ((select private.can_access_athlete(athlete_id)));

create policy "Guardians can answer an athlete's plan screens" on public.plan_screen_answers
  for insert to authenticated
  with check ((select private.is_guardian_of_athlete(athlete_id)));

-- Session marks: the parent or the athlete's own login can tick and untick.
create policy "Family can read an athlete's finished sessions" on public.plan_session_completions
  for select to authenticated
  using ((select private.can_access_athlete(athlete_id)));

create policy "Family can mark an athlete's session done" on public.plan_session_completions
  for insert to authenticated
  with check ((select private.can_access_athlete(athlete_id)));

create policy "Family can untick an athlete's session" on public.plan_session_completions
  for delete to authenticated
  using ((select private.can_access_athlete(athlete_id)));
