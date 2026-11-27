/**
 * Reports which keys in .env.local are set and whether the services answer.
 * Never prints a key's value.
 *
 *   npm run check:env
 */

type Check = { name: string; ok: boolean; detail: string };

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "ANTHROPIC_API_KEY",
  "RESEND_API_KEY",
] as const;

const OPTIONAL_KEYS = ["STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_SITE_URL", "EMAIL_FROM", "SUPABASE_DB_URL"] as const;

const REQUEST_TIMEOUT_MS = 10_000;

function isSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

async function probe(name: string, url: string, headers: Record<string, string>): Promise<Check> {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    const body = (await response.text()).slice(0, 200).replace(/\s+/g, " ");
    return { name, ok: response.ok, detail: `HTTP ${response.status}${response.ok ? "" : ` ${body}`}` };
  } catch (error) {
    return { name, ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

async function main(): Promise<void> {
  console.log("Keys");
  for (const key of REQUIRED_KEYS) {
    console.log(`  ${isSet(key) ? "set    " : "MISSING"}  ${key}`);
  }
  for (const key of OPTIONAL_KEYS) {
    console.log(`  ${isSet(key) ? "set    " : "not set"}  ${key} (optional)`);
  }

  const checks: Check[] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (supabaseUrl) {
    checks.push(await probe("Supabase auth (anon key)", `${supabaseUrl}/auth/v1/settings`, { apikey: anonKey }));
    checks.push(
      await probe("Supabase benchmarks table (anon key)", `${supabaseUrl}/rest/v1/benchmarks?select=id&limit=1`, {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      }),
    );
    checks.push(
      await probe("Supabase admin API (service-role key)", `${supabaseUrl}/auth/v1/admin/users?per_page=1`, {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      }),
    );
  }
  if (isSet("STRIPE_SECRET_KEY")) {
    checks.push(
      await probe("Stripe (secret key)", "https://api.stripe.com/v1/balance", {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      }),
    );
    const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ? "test mode" : "NOT a test-mode key";
    checks.push({ name: "Stripe key mode", ok: mode === "test mode", detail: mode });
  }
  if (isSet("RESEND_API_KEY")) {
    const resend = await probe("Resend (API key)", "https://api.resend.com/domains", {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    });
    // A send-only key can't list domains, but sending is all the app does with it.
    const isSendOnly = resend.detail.includes("restricted_api_key");
    checks.push(isSendOnly ? { name: resend.name, ok: true, detail: "send-only key (fine: the app only sends)" } : resend);
  }
  if (isSet("ANTHROPIC_API_KEY")) {
    checks.push(
      await probe("Anthropic (API key)", "https://api.anthropic.com/v1/models?limit=1", {
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      }),
    );
  }

  console.log("\nServices");
  for (const check of checks) {
    console.log(`  ${check.ok ? "ok  " : "FAIL"}  ${check.name}: ${check.detail}`);
  }

  const missing = REQUIRED_KEYS.filter((key) => !isSet(key));
  if (missing.length > 0 || checks.some((check) => !check.ok)) {
    process.exitCode = 1;
  }
}

await main();

export {};
