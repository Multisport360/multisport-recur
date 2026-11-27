import { z } from "zod";

/**
 * Every environment variable the app reads, in one place.
 *
 * Nothing is read at import time. Each getter checks only the keys it needs and throws
 * an error that names the missing key, so a page that does not need Stripe keeps working
 * when the Stripe key is absent.
 */

const nonEmpty = z.string().trim().min(1);

/** Thrown when a key is missing or malformed. The message is safe to show in logs. */
export class MissingEnvError extends Error {
  readonly keys: readonly string[];

  constructor(keys: readonly string[]) {
    super(
      `Missing or invalid environment variable${keys.length > 1 ? "s" : ""}: ${keys.join(", ")}. ` +
        "Add to .env.local (local) or to the Vercel project settings (deployed), then restart.",
    );
    this.name = "MissingEnvError";
    this.keys = keys;
  }
}

type Shape = Record<string, z.ZodType<string>>;

function readEnv<T extends Shape>(shape: T, source: Record<string, string | undefined>): { [K in keyof T]: string } {
  const badKeys: string[] = [];
  const values: Record<string, string> = {};
  for (const [key, schema] of Object.entries(shape)) {
    const parsed = schema.safeParse(source[key]);
    if (parsed.success) {
      values[key] = parsed.data;
    } else {
      badKeys.push(key);
    }
  }
  if (badKeys.length > 0) {
    throw new MissingEnvError(badKeys);
  }
  return values as { [K in keyof T]: string };
}

/** Public Supabase settings. Safe in the browser. */
export function supabasePublicEnv() {
  // NEXT_PUBLIC_ values must be referenced by their full name so Next can inline them.
  return readEnv(
    { NEXT_PUBLIC_SUPABASE_URL: z.url(), NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty },
    {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );
}

/** Service-role key. Server only: it bypasses row-level security. */
export function supabaseServiceEnv() {
  return {
    ...supabasePublicEnv(),
    ...readEnv({ SUPABASE_SERVICE_ROLE_KEY: nonEmpty }, process.env),
  };
}

export function stripeEnv() {
  return readEnv({ STRIPE_SECRET_KEY: nonEmpty }, process.env);
}

export function stripeWebhookEnv() {
  return readEnv({ STRIPE_WEBHOOK_SECRET: nonEmpty }, process.env);
}

export function resendEnv() {
  return readEnv({ RESEND_API_KEY: nonEmpty }, process.env);
}

export function anthropicEnv() {
  return readEnv({ ANTHROPIC_API_KEY: nonEmpty }, process.env);
}

/** Where the site lives, for links in emails and Stripe return URLs. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
