import { test as base, expect, type Page } from "@playwright/test";
import { adminClient, cleanUp, createFamilyWithoutSignIn, type Client } from "../../tests/db/helpers";

export type E2eFamily = Awaited<ReturnType<typeof createFamilyWithoutSignIn>>;

/**
 * Test accounts for end-to-end tests. They are real users in the Supabase project
 * named in .env.local, created through the admin API (so no email is sent) and
 * deleted after each test.
 */

type Fixtures = {
  admin: Client;
  /** Makes a parent account with an empty family. Call it more than once for more families. */
  newParent: (label: string) => Promise<E2eFamily>;
};

export const test = base.extend<Fixtures>({
  // Playwright requires the first argument to be a destructuring pattern.
  admin: async ({}, provide) => {
    await provide(adminClient());
  },
  newParent: async ({ admin }, provide) => {
    const familyIds: string[] = [];
    await provide(async (label) => {
      const family = await createFamilyWithoutSignIn(admin, `e2e-${label}`);
      familyIds.push(family.familyId);
      return family;
    });

    // Athlete logins are separate users: remove them before their athletes disappear.
    if (familyIds.length > 0) {
      const logins = await admin.from("athletes").select("login_user_id").in("family_id", familyIds).not("login_user_id", "is", null);
      for (const row of logins.data ?? []) {
        if (row.login_user_id) await admin.auth.admin.deleteUser(row.login_user_id);
      }
    }
    await cleanUp(admin, familyIds);
  },
});

export { expect };

/** Sign in through the real sign-in page. */
export async function signIn(page: Page, user: { email: string; password: string }, next?: string): Promise<void> {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** A one-time email link for a user, in the form our /auth/confirm page accepts. No email is sent. */
export async function emailLinkFor(admin: Client, email: string): Promise<string> {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error) throw new Error(`could not make an email link: ${link.error.message}`);
  return `/auth/confirm?token_hash=${link.data.properties.hashed_token}&type=magiclink`;
}

export const THIS_YEAR = new Date().getFullYear();
