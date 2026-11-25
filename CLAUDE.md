# Multi-Sport Recur — rules for every Claude Code session

Read this whole file before writing any code. If a request conflicts with this file, stop and ask.

## What this product is
A web app for high school athletes (8th–12th grade) and their parents. A parent adds an athlete, enters the numbers college coaches ask for (fastball velocity, 40-yard dash, 100m time...), and sees which college level those numbers reach today and how far the next level is. Sports at launch: baseball, football, track & field. The gap report is free. The training plan is a paid subscription.

## Stack
- Next.js (App Router) + TypeScript + Tailwind, hosted on Vercel
- Supabase (Postgres, Auth, row-level security)
- Stripe Checkout + Billing for the subscription
- Claude API only for wording plan tips. Never for benchmarks, comparisons or medical/training safety decisions.
- Old site code lives in `legacy/`. Never import from it or copy its styles.

## Design direction
The site should look like it came from the world of athletic testing: a blue track with white lane lines, hurdle yellow, a radar gun readout, a combine score card, a tape measure on a runway. Not like a website template.

The one memorable element is the **GapRuler**: a horizontal scale marked with college levels, with the athlete's number as a yellow marker. Spend boldness there. Keep everything else quiet.

### Tokens (use only these)
| Token | Hex | Use |
| --- | --- | --- |
| track-blue | #1F4E9C | primary actions, links, ruler level bands (as tints) |
| lane-white | #F6F8FB | page background |
| chalk | #DCE3EC | dividers, input borders, quiet surfaces |
| infield-navy | #14284A | all text and headings |
| hurdle-yellow | #F2C230 | ONLY the athlete's own marker and own numbers |

- Fonts: **Big Shoulders Display** for headings and big stat numbers; **Atkinson Hyperlegible Next** for everything else. Load with next/font. Tabular numerals for every number.
- Headings in sentence case. Left-aligned layouts, one main column.
- Spacing on an 8px step. Border radius: 4px on inputs and buttons, 0 on page sections. No shadows except focus rings.
- Status (ahead / on pace / behind) is shown by position on the ruler plus words. Never by red/green alone.

### Home page first screen
```
Find out what college level your numbers reach.

[ Baseball v ] [ Pitcher v ]   Fastball velocity [ 84 ] mph

JUCO      D3/NAIA      D2         D1 mid-major      D1 Power 4
|---------|-----------|-----------|-----------------|---------->
                              ^ 84 mph
                     You're in D2 range. 6 mph to D1 mid-major.

[ Get the full report ]
```

### Never do (these make a site look AI-generated)
- Inter, Geist, Roboto, system fonts, or serif "editorial" display fonts
- Gradients, glassmorphism, glows, blurred colour blobs
- Cream/beige backgrounds, terracotta accents, black backgrounds with neon accents
- Grids of identical rounded cards with an icon in a circle + title + two lines (the "features" block)
- Small ALL-CAPS labels above headings; "01 / 02 / 03" markers unless content is a real sequence
- Middle-dot meta strings ("A · B · C"); "→" appended to buttons or links
- "Get started" / "Learn more" buttons. Buttons say what happens: "See my gap report", "Add an athlete"
- Fade-in or slide-up on scroll, hover lift on cards. The only motion is the ruler marker sliding to its value (off when prefers-reduced-motion)
- Fake testimonials, "10,000+ athletes" counters, logo walls of schools
- Filler copy: "unlock your potential", "elevate your game", "AI-powered", "seamless", "next level", "journey"
- Emoji as icons; stock photos; AI-generated people; shadcn/ui or Tailwind UI components left in stock styling
- Dark-mode toggles, chat bubbles, confetti

### Copy rules
Plain words, active voice, sentence case. Name things the way a parent would. Errors say what went wrong and how to fix it, without apologising. Empty screens tell the person what to do next.

### Review step (every session)
Before saying a task is done: take Playwright screenshots of every page you changed at 390px and 1280px, look at them, check against "Never do", fix what breaks it, and list what you checked.

## Data model
Tables: families, guardians, consents, athletes, athlete_sports, stat_entries, benchmarks, sources, subscriptions, plan_templates.
- athletes: family_id, first_name, grad_year, birth_year (year only, never full birth date), height_in, weight_lb, gender, login_user_id (null if under 13)
- stat_entries: athlete_id, sport, metric, value, unit, measured_on, how_measured (self | coach | event). Never overwrite; every entry is a new row.
- benchmarks: loaded from data/benchmarks.csv (sport, position_or_event, gender, metric, unit, better, level, level_code, entry, mid, elite, confidence, notes, source_id). Read-only except admin.
- consents: family_id, guardian_id, athlete_id, consent_version, method, accepted_at
- Row-level security on EVERY table. Guardians see only their family's rows; an athlete login sees only its own rows.

## Benchmark rules
- Benchmarks come only from the benchmarks table. The AI never invents, edits or estimates a benchmark.
- All comparisons are plain TypeScript functions with unit tests. `better = lower` means smaller is better (times); `higher` means bigger is better; `range` is height/weight.
- Rows with confidence "Low" are labelled "rough guide". Benchmark sources are stored in the sources table but are not shown in the app. They will be shown on the public website later.
- Until on-pace targets exist, athletes in grades 8–11 see "These are senior-year targets."

## Legal rules (from the Legal & Compliance Plan)
- Parents create accounts. No athlete data is saved before a consent record exists.
- Athletes under 13 never get their own login. 13+ get a login linked to one athlete, invited by the parent.
- Collect the minimum: no full birth dates, no addresses, no school IDs, no photos at MVP.
- Public profiles are private by default; the parent turns sharing on per athlete.
- No open-ended AI chat for minors.
- Training plans come only from coach-reviewed plan_templates. If none matches, say it's coming; never generate one.
- Show safety notes on every plan; extra caution on throwing-velocity work for younger athletes.

## Billing rules
- Before checkout, show price, renewal frequency, next charge date and how to cancel; require a checkbox agreeing to renewal terms.
- Cancel online from the account page in two clicks or fewer. Send a confirmation email on signup, renewal reminder and cancel.

## Working style
- Kai has basic Python and is learning web dev. Explain what you changed in plain language and give exact terminal commands.
- Small commits with clear messages on the `rebuild` branch. Never push to `main`.
- Ask before adding a new dependency.
