-- ---------------------------------------------------------------------------
-- The fifth plan question: "How many team practices or games does the athlete
-- have in a typical week?" Each one counts as a hard day toward the plan's
-- weekly limit (plan_rules in data/plan_templates.draft.json).
--
-- 0 to 7, where 7 means "7 or more". Rows saved before this question existed
-- stay null: the plan page asks the parent to answer again before the next plan,
-- rather than guessing 0 and building a week that is too hard.
-- ---------------------------------------------------------------------------

alter table public.plan_screen_answers
  add column team_sessions_per_week smallint
    constraint plan_screen_answers_team_sessions_range check (team_sessions_per_week between 0 and 7);

comment on column public.plan_screen_answers.team_sessions_per_week is
  'Team practices or games in a typical week (7 = 7 or more). Null on answers saved before the question was asked.';

-- Parents may fill the new column on insert, like the other answers. Rows are still never updated.
grant insert (team_sessions_per_week) on table public.plan_screen_answers to authenticated;
