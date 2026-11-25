# Multi-Sport Recur

A web app for high school athletes (8th to 12th grade) and their parents. A parent adds an athlete, enters the numbers college coaches ask for (fastball velocity, 40-yard dash, 100m time...), and sees which college level each number reaches today and how far the next level is. Sports: baseball, football, track & field. The gap report is free; the training plan is a paid subscription.

The rules for how it looks, what data it may keep and how billing works are in [CLAUDE.md](CLAUDE.md). Read that first.

## What's where

| Folder | What it holds |
| --- | --- |
| `src/app/` | Pages (Next.js App Router). `(auth)` is sign-up/sign-in, `(app)` is the signed-in area, `api/stripe/webhook` receives Stripe events. |
| `src/components/gap-ruler/` | The GapRuler, the ruler every result is shown on. |
| `src/lib/benchmarks/` | The comparison engine (plain functions with unit tests), the CSV importer, and the wording of results. |
| `src/lib/report/` | Builds an athlete's full gap report and the multi-sport summary. |
| `src/lib/billing/`, `src/lib/plan/` | Stripe subscription, billing emails, coach-reviewed plan templates, optional AI tips. |
| `src/config/` | Settings you are expected to change: price (`billing.ts`), consent method (`consent.ts`). |
| `supabase/migrations/` | The database: every table, row-level security, and the rules enforced in the database. |
| `data/benchmarks.csv` | The benchmark numbers. The only source of benchmarks. |
| `e2e/`, `tests/db/` | End-to-end tests (Playwright) and database tests (row-level security). Unit tests sit next to the code as `*.test.ts`. |
| `legacy/` | The old site. Never imported, never built. |

## Run it on your computer

You need Node.js 22.18 or newer (`node -v` to check).

```bash
npm install
npx playwright install chromium   # once, for the end-to-end tests and screenshots
npm run check:env                 # says which keys are set and whether each service answers
npm run dev                       # then open http://localhost:3000
```

### Keys (`.env.local`)

| Key | Needed for | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | everything | Supabase dashboard, Project Settings, API |
| `SUPABASE_SERVICE_ROLE_KEY` | athlete invites, billing, seeding, tests | same page. Server only; never put it in a `NEXT_PUBLIC_` variable |
| `SUPABASE_DB_URL` | `npm run db:push` | Supabase dashboard, Connect, Session pooler (fill in your database password) |
| `STRIPE_SECRET_KEY` | the paid training plan | Stripe dashboard in **test mode**, Developers, API keys (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | billing emails and keeping subscriptions in step | see "Stripe" below (`whsec_...`) |
| `RESEND_API_KEY` | athlete invites and billing emails | resend.com, API Keys |
| `EMAIL_FROM` | sending from your own domain | an address on a domain verified in Resend. Leave it unset until you have a domain (see "Email" below) |
| `ANTHROPIC_API_KEY` | AI tips on plans (off by default) | console.anthropic.com |
| `PLAN_TIPS_FROM_CLAUDE` | turning AI tips on | set to `true` only once coach-reviewed templates exist |
| `CONSENT_METHOD` | swapping the consent method | defaults to `checkbox_attestation` (see "Decisions still open") |
| `NEXT_PUBLIC_SITE_URL` | links in emails and Stripe return links | e.g. `https://your-domain.com`. On Vercel it is worked out automatically |

A missing key never crashes a page that doesn't need it. Pages that do need it say so in plain words, and the server log names the key.

## Database

```bash
npm run db:push    # apply supabase/migrations to the project in SUPABASE_DB_URL
npm run db:check   # check data/benchmarks.csv and list rows that look wrong (no database needed)
npm run db:seed    # load data/benchmarks.csv into the benchmarks table
```

`db:seed` checks every row first and stops with a list of every problem if even one row is bad. Nothing is written until the whole file is clean. After a successful seed the table matches the file exactly. To change a benchmark, edit the CSV and seed again; the website picks it up within five minutes.

Row-level security is on for every table. A parent sees only their family's rows; an athlete login sees only its own athlete. These rules are also enforced in the database: no athlete row without a consent record, no login for an athlete under 13, stat entries can never be overwritten, and a family is deleted when its last parent login is deleted.

### Supabase settings

1. **"Confirm email" is OFF** (Authentication, Sign In / Providers, Email). This was decided in Nov 2026 because there is no custom email domain yet. New parents are signed in straight away and Supabase sends no email at sign-up. An end-to-end test checks this, and it fails on purpose if the setting is switched on (sign-up would then go to the "Check your email" page, which already exists).
2. **Authentication, URL Configuration:** set Site URL to your site, and add `https://your-domain.com/auth/confirm` (and `http://localhost:3000/auth/confirm`) to Redirect URLs.
3. **When you have a domain:** set up custom SMTP (Authentication, Emails, SMTP; Resend works: host `smtp.resend.com`, user `resend`, password = a Resend API key), then switch "Confirm email" on if you want it. For the most reliable links, change each email template's link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (`type=recovery` in the reset-password template).

### Email (no custom domain yet)

The app sends its own email through Resend: athlete invites and the three billing emails (signup confirmation, renewal reminder, cancel confirmation). Until a domain is verified in Resend, mail comes from `onboarding@resend.dev`, and **Resend only delivers it to the Resend account owner's own address and to Resend's test inboxes** (`delivered@resend.dev`, with optional `+label`). What that means today:

- An athlete invite to any other address is refused by Resend. The page says the email couldn't be sent and creates no login.
- Billing emails to any parent except you are refused and logged on the server (`[email] ... was not sent`). The subscription itself still works.
- The end-to-end tests send to `delivered+<label>@resend.dev`, so they pass in this setup.

To lift the limit: verify a domain in Resend, set `EMAIL_FROM` (for example `Multi-Sport Recur <hello@your-domain.com>`) locally and on Vercel, and nothing else changes. A send-only Resend key is enough; `npm run check:env` reports it as "send-only key".

## Tests

```bash
npm test           # unit tests (Vitest): comparison engine, CSV checks, wording, billing logic
npm run test:db    # row-level security against the real Supabase project
npm run test:e2e   # end-to-end (Playwright) at 390px and 1280px, against a production build
npm run lint
npm run typecheck
npm run build
```

`test:db` and `test:e2e` create throwaway users with `@example.com` addresses in the Supabase project from `.env.local`, and delete them afterwards. Run them against a development project, not production.

Tests that sign in run once (desktop width), not twice, because Supabase limits sign-ins per IP. If you still see `Request rate limit reached`, wait five minutes, or raise the limit under Authentication, Rate Limits.

One end-to-end test sends a real email (`e2e/sends-email.spec.ts`, to Resend's test inbox). It needs `RESEND_API_KEY`. The checkout test creates a customer in your Stripe **test** account each run; that is harmless and can be cleared in the Stripe dashboard.

### Screenshots for the design review

```bash
npm run build && npm run start -- -p 3101    # terminal 1
npm run screenshots -- http://localhost:3101 # terminal 2: every page at 390px and 1280px into screenshots/
```

## Stripe (test mode)

1. Put your test-mode secret key in `STRIPE_SECRET_KEY`. The app refuses a live key outside Vercel production.
2. To get webhook events on your computer, install the Stripe CLI (`brew install stripe/stripe-cli/stripe`), then:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   It prints a `whsec_...` secret: put it in `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.
3. Pay with the test card `4242 4242 4242 4242`, any future date, any CVC.
4. Renewal reminders come from Stripe's `invoice.upcoming` event. Turn it on in the Stripe dashboard: Settings, Billing, Subscriptions and emails, "Upcoming renewal events", and pick how many days before renewal.

Events the webhook handles: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.upcoming`.

## Deploy to Vercel

1. Push the `rebuild` branch to GitHub, then in Vercel: Add New, Project, import the repo. Framework: Next.js. Build command `npm run build` (the default).
2. In the project's Settings, Environment Variables, add every key from the table above. Use Stripe **test** keys until you are ready to take real payments.
3. In Stripe (test mode), Developers, Webhooks, add an endpoint `https://your-domain.com/api/stripe/webhook` with the five events above, and copy its signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel.
4. In Supabase, add your Vercel domain to Authentication, URL Configuration (step 3 of "Supabase settings").
5. Run `npm run db:push` and `npm run db:seed` once against the production Supabase project (with that project's keys in `.env.local`).
6. Run the end-to-end tests against a preview deployment if you like: `E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e`.

## Training plans

Plans are built by plain TypeScript in `src/lib/plan/` (no AI) from one template library: `data/plan_templates.draft.json`, stored as one row of `plan_templates` (`content` holds the JSON).

| Command | What it does |
| --- | --- |
| `npm run plans:check` | Checks the JSON file and lists every problem. Changes nothing. |
| `npm run plans:seed` | Checks the file, then saves it to `plan_templates` as a **draft**. |

- **Families only ever see an approved library.** Drafts are read only when `ALLOW_DRAFT_PLANS=true` **and** the app runs with `npm run dev`. Any `npm run build` (Vercel included) ignores drafts, even with the flag set. Draft pages carry the banner "Sample plan, not coach-reviewed. For testing only."
- **Going live** after the coach signs off, in the Supabase SQL editor:
  ```sql
  update plan_templates
  set review_status = 'approved', reviewed_by = 'Coach name, CSCS', reviewed_on = '2026-12-01'
  where version = 'draft-2026-11-17';
  ```
  The database refuses `approved` without a reviewer and a date.
- Each family has a `timezone` (IANA name from the parent's browser at sign-up; America/New_York for families made before). Dates shown in the app and emails, today's date on the stat form, and the Monday each 6-week block starts all use it. Code: `src/lib/dates.ts`.
- `plan_screen_answers` keeps every set of answers to the 4 plan questions (the newest counts). `plan_session_completions` keeps the "Mark this session done" ticks.
- `src/lib/plan/metric-map.ts` links each benchmark metric to the template's stat names; a unit test fails if a metric in `data/benchmarks.csv` has no mapping.

## Decisions still open (placeholders in the code)

| Decision | Where it lives now |
| --- | --- |
| COPPA verifiable parental consent method | `src/config/consent.ts` and `src/lib/consent/methods.ts`. Today: a two-checkbox attestation, which is **not** a verified method for children under 13. Add a method, then set `CONSENT_METHOD`. Bump `CONSENT_VERSION` when the wording changes. |
| Training plan price and interval | `src/config/billing.ts`: **$12 a month is a placeholder.** |
| Coach-reviewed plan templates | See "Training plans" below. Until a template library is approved, every subscriber sees "Your plan is coming". |
| Benchmark data gaps | `npm run db:check` lists rows that look wrong. Benchmark values are only changed in `data/benchmarks.csv`. |
