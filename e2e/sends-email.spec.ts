import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { addAthlete, type TestFamily } from "../tests/db/helpers";
import { emailLinkFor, expect, signIn, test, THIS_YEAR } from "./support/accounts";

/**
 * Tests that send a real email. Each sends ONE message to a Resend test inbox
 * (delivered@resend.dev), so this file runs on the desktop project only
 * (see playwright.config.ts) instead of once per screen width.
 */

// Needs email delivery set up for Supabase Auth (see README, "Email").
test("creating an account sends a confirmation email", async ({ page, admin }) => {
  const email = `delivered+signup-${randomUUID().slice(0, 8)}@resend.dev`;

  try {
    await page.goto("/signup");
    await page.getByLabel("Your email").fill(email);
    await page.getByLabel("Password").fill(`pw-${randomUUID()}`);
    await page.getByLabel(/I'm a parent or legal guardian/).check();
    await page.getByRole("button", { name: "Create my account" }).click();

    await expect(page).toHaveURL(/\/signup\/check-email$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email");
  } finally {
    const users = await admin.auth.admin.listUsers({ perPage: 200 });
    const created = users.data?.users.find((user) => user.email === email);
    if (created) await admin.auth.admin.deleteUser(created.id);
  }
});

/** Invite an athlete through the page. Sends one real email to a Resend test inbox. Needs RESEND_API_KEY. */
async function inviteThroughPage(page: Page, parent: TestFamily, athleteId: string, name: string): Promise<string> {
  const email = `delivered+invite-${randomUUID().slice(0, 8)}@resend.dev`;
  await signIn(page, parent.user);
  await page.goto(`/athletes/${athleteId}/invite`);
  await page.getByLabel(`${name}'s email`).fill(email);
  await page.getByRole("button", { name: "Send the invite" }).click();
  await expect(page.getByRole("status")).toHaveText(`The invite is on its way to ${name}'s email.`);
  return email;
}

test("an invited athlete gets a login tied to that one athlete and sees nothing else", async ({ page, admin, newParent }) => {
  const parent = await newParent("invite");
  const invited = await addAthlete(parent, "Morgan", THIS_YEAR - 15);
  const sibling = await addAthlete(parent, "Casey", THIS_YEAR - 16);

  const email = await inviteThroughPage(page, parent, invited.athleteId, "Morgan");

  const row = await admin.from("athletes").select("login_user_id").eq("id", invited.athleteId).single();
  expect(row.data?.login_user_id).toBeTruthy();
  const login = await admin.auth.admin.getUserById(row.data?.login_user_id ?? "");
  expect(login.data.user?.email).toBe(email);
  expect(login.data.user?.app_metadata.role).toBe("athlete");
  await expect(page.getByTestId("athlete-login")).toContainText("Morgan has a login.");

  // Now as the athlete.
  await page.context().clearCookies();
  await page.goto(await emailLinkFor(admin, email));
  await expect(page).toHaveURL(new RegExp(`/athletes/${invited.athleteId}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Morgan");
  await expect(page.getByRole("link", { name: "My report" })).toBeVisible();
  await expect(page.getByTestId("athlete-login")).toHaveCount(0);

  await page.goto(`/athletes/${sibling.athleteId}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page isn't here");
  for (const parentOnly of ["/athletes/new", "/consent", `/athletes/${invited.athleteId}/invite`]) {
    await page.goto(parentOnly);
    await expect(page).toHaveURL(new RegExp(`/athletes/${invited.athleteId}$`));
  }
});
