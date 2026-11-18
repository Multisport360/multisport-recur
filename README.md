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
| `EMAIL_FROM` | sending from your own domain | an address on a domain verified in Resend. Without it, mail comes from Resend's test sender, which only delivers to your own Resend account |
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

### Supabase settings to check in the dashboard

1. **Authentication, Sign In / Providers, Email: turn on "Confirm email".** Without it, new parents are signed in straight away and no confirmation email is sent.
2. **Authentication, Emails, SMTP: set up custom SMTP** (Resend works: host `smtp.resend.com`, user `resend`, password = your Resend API key). Supabase's built-in mailer only sends a few emails an hour.
3. **Authentication, URL Configuration:** set Site URL to your site, and add `https://your-domain.com/auth/confirm` (and `http://localhost:3000/auth/confirm`) to Redirect URLs.
4. **Optional, Authentication, Emails, templates:** the confirm page understands Supabase's default links. For the most reliable links across devices, change each template's link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (use `type=recovery` in the reset-password template).

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

Two end-to-end tests send a real email (`e2e/sends-email.spec.ts`). They need `RESEND_API_KEY` and the Supabase email settings above.

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

## Decisions still open (placeholders in the code)

| Decision | Where it lives now |
| --- | --- |
| COPPA verifiable parental consent method | `src/config/consent.ts` and `src/lib/consent/methods.ts`. Today: a two-checkbox attestation, which is **not** a verified method for children under 13. Add a method, then set `CONSENT_METHOD`. Bump `CONSENT_VERSION` when the wording changes. |
| Training plan price and interval | `src/config/billing.ts`: **$12 a month is a placeholder.** |
| Coach-reviewed plan templates | `plan_templates` table. Insert with `is_published = true` only after a coach has reviewed it (`reviewed_by`, `reviewed_at` are required). Until then, every subscriber sees "Your plan is coming". |
| Benchmark data gaps | `npm run db:check` lists rows that look wrong. Benchmark values are only changed in `data/benchmarks.csv`. |
