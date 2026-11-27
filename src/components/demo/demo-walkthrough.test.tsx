import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

/**
 * A demo walkthrough with Supabase, Stripe, Resend and the Claude API replaced by traps. The test fails
 * if any demo screen, action or the server loader imports one of them, or touches one in any way.
 */

const touched = vi.hoisted(() => {
  const log: string[] = [];
  // Anything: calling it, constructing it, or reading a property from it is written down and refused.
  const trap = (name: string): unknown =>
    new Proxy(function trapped() {}, {
      get(_target, property) {
        if (property === "then" || typeof property === "symbol") return undefined;
        log.push(`${name}.${property}`);
        return trap(`${name}.${property}`);
      },
      apply() {
        log.push(`${name}()`);
        throw new Error(`${name} was called during the demo`);
      },
      construct() {
        log.push(`new ${name}`);
        throw new Error(`${name} was created during the demo`);
      },
    });
  return { log, trap };
});

vi.mock("@supabase/supabase-js", () => {
  touched.log.push("import @supabase/supabase-js");
  return { createClient: touched.trap("supabase.createClient"), default: touched.trap("supabase") };
});
vi.mock("@supabase/ssr", () => {
  touched.log.push("import @supabase/ssr");
  return { createServerClient: touched.trap("ssr.createServerClient"), createBrowserClient: touched.trap("ssr.createBrowserClient") };
});
vi.mock("stripe", () => {
  touched.log.push("import stripe");
  return { default: touched.trap("Stripe"), Stripe: touched.trap("Stripe") };
});
vi.mock("resend", () => {
  touched.log.push("import resend");
  return { Resend: touched.trap("Resend"), default: touched.trap("Resend") };
});
vi.mock("@anthropic-ai/sdk", () => {
  touched.log.push("import @anthropic-ai/sdk");
  return { default: touched.trap("Anthropic"), Anthropic: touched.trap("Anthropic") };
});

// Imported after the mocks, so any path from the demo to those services would hit a trap.
const { loadDemoData } = await import("@/lib/demo/load");
const model = await import("@/lib/demo/model");
const { DemoProvider } = await import("./DemoProvider");
const { DemoShell } = await import("./DemoShell");
const { DemoReport } = await import("./screens/DemoReport");
const { DemoAddStat } = await import("./screens/DemoAddStat");
const { DemoPlan } = await import("./screens/DemoPlan");
const { DemoAccount } = await import("./screens/DemoAccount");
const { DemoSubscribe } = await import("./screens/DemoSubscribe");
const { EMPTY_FORM_STATE } = await import("@/lib/forms");

const TODAY = new Date("2026-11-27T17:00:00Z");
const pushed: string[] = [];
const router = { push: (href: string) => pushed.push(href), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn(), prefetch: vi.fn() } as unknown as AppRouterInstance;

let data: ReturnType<typeof loadDemoData>;

beforeAll(() => {
  data = loadDemoData();
});

afterEach(() => {
  pushed.length = 0;
});

/** The rendered screen as plain text, the way a person reads it. */
function render(screen: ReactNode, state = model.initialDemoState(TODAY), pathname = "/demo"): string {
  const html = renderToString(
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value={pathname}>
        <DemoProvider data={data} start={{ today: TODAY, state }}>
          <DemoShell>{screen}</DemoShell>
        </DemoProvider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>,
  );
  return html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function statForm(values: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

describe("a demo walkthrough never touches Supabase, Stripe, Resend or the Claude API", () => {
  test("report, add a number, report again, plan, account, checkout, restart", async () => {
    // 1. The gap report, with the demo bar and the tab bar.
    const report = render(<DemoReport saved={undefined} />);
    expect(report).toContain("Jordan's gap report");
    expect(report).toContain("Demo, sample data");
    expect(report).toContain("Restart demo");
    expect(report).toMatch(/81 mph/);

    // 2. Add a number with the demo's own save, through the provider like the form does.
    let saveStat: ((sportId: string) => (previous: typeof EMPTY_FORM_STATE, form: FormData) => unknown) | null = null;
    const { useDemo } = await import("./DemoProvider");
    function Grab() {
      saveStat = useDemo().saveStat;
      return null;
    }
    expect(render(<DemoAddStat sportId="demo-baseball-pitcher" metric="Fastball velocity" />, undefined, "/demo/stats")).toContain("Fastball velocity (mph)");
    render(<Grab />);
    const result = await (saveStat as unknown as (id: string) => (p: unknown, f: FormData) => Promise<unknown>)("demo-baseball-pitcher")(
      EMPTY_FORM_STATE,
      statForm({ metric: "Fastball velocity", value: "84", measuredOn: "2026-11-27", howMeasured: "coach" }),
    );
    expect(result).toEqual(EMPTY_FORM_STATE);
    expect(pushed).toEqual(["/demo?saved=Fastball%20velocity"]);

    // 3. The report after saving: the ruler shows the new number.
    const after = model.saveDemoStat(data, model.initialDemoState(TODAY), "demo-baseball-pitcher", statForm({ metric: "Fastball velocity", value: "84", measuredOn: "2026-11-27", howMeasured: "coach" }), TODAY);
    const reportAfter = render(<DemoReport saved="Fastball velocity" />, after.state);
    expect(reportAfter).toMatch(/84 mph/);
    expect(reportAfter).toContain("Saved. The fastball velocity ruler below shows the new number.");

    // 4. The plan, with both banners.
    const plan = render(<DemoPlan week={undefined} />, after.state, "/demo/plan");
    expect(plan).toContain("Demo, sample athlete");
    expect(plan).toContain("Sample plan, not coach-reviewed.");
    expect(plan).toContain("Week 2 of 6");

    // 5. Account and checkout: marked as a demo, and no payment form posts anywhere.
    const account = render(<DemoAccount />, after.state, "/demo/account");
    expect(account).toContain("Demo Parent");
    expect(account).toContain("Demo.");
    expect(render(<DemoSubscribe />, after.state, "/demo/subscribe")).toContain("Continue to payment");
    expect(model.demoCheckout(statForm({ agreesToRenewal: "on" })).message).toBe(model.CHECKOUT_SKIPPED);

    // 6. Nothing reached, or was even imported from, any outside service.
    expect(touched.log).toEqual([]);
  });
});
