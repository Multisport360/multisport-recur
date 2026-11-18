import Stripe from "stripe";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "./route";

const SECRET = "whsec_test_secret";
const URL = "http://localhost/api/stripe/webhook";

function request(body: string, signature?: string): NextRequest {
  return new NextRequest(URL, {
    method: "POST",
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  });
}

beforeEach(() => {
  // Fake test-mode values. Nothing here talks to Stripe or Supabase.
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake_for_unit_tests");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/stripe/webhook", () => {
  const payload = JSON.stringify({ id: "evt_1", object: "event", type: "charge.succeeded", data: { object: {} } });

  test("refuses a request with no signature", async () => {
    const response = await POST(request(payload));
    expect(response.status).toBe(400);
  });

  test("refuses a forged signature", async () => {
    const forged = new Stripe("sk_test_x").webhooks.generateTestHeaderString({ payload, secret: "whsec_wrong" });
    const response = await POST(request(payload, forged));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid Stripe signature." });
  });

  test("accepts a correctly signed event", async () => {
    const signature = new Stripe("sk_test_x").webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const response = await POST(request(payload, signature));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, handled: false, note: "ignored charge.succeeded" });
  });

  test("says billing is not configured when the webhook secret is missing", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const response = await POST(request(payload, "t=1,v1=x"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Billing is not configured on this server." });
  });
});
