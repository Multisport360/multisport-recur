import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { addAthleteAsAdmin } from "../tests/db/helpers";
import { emailLinkFor, expect, signIn, test, THIS_YEAR, type E2eFamily } from "./support/accounts";

/**
 * Tests that send a real email through Resend. Without a verified domain, Resend's test sender
 * (onboarding@resend.dev) only delivers to the account owner and to Resend's test inboxes, so
 * every address here is delivered+<label>@resend.dev. Each test sends ONE message, so this file
 * runs on the desktop project only (see playwright.config.ts). Needs RESEND_API_KEY.
 */

/** Invite an athlete through the page. Sends one real email to a Resend test inbox. Needs RESEND_API_KEY. */
async function inviteThroughPage(page: Page, parent: E2eFamily, athleteId: string, name: string): Promise<string> {
  const email = `delivered+invite-${randomUUID().slice(0, 8)}@resend.dev`;
  await signIn(page, parent.user);
  await page.goto(`/athletes/${athleteId}/invite`);
  await page.getByLabel(`${name}'s email`).fill(email);
  await page.getByRole("button", { name: "Send the invite" }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText(`The invite is on its way to ${name}'s email.`);
  return email;
}

test("an invited athlete gets a login tied to that one athlete and sees nothing else", async ({ page, admin, newParent }) => {
  const parent = await newParent("invite");
  const invited = await addAthleteAsAdmin(admin, parent, "Morgan", THIS_YEAR - 15);
  const sibling = await addAthleteAsAdmin(admin, parent, "Casey", THIS_YEAR - 16);

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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("My gap report");
  await expect(page.getByRole("link", { name: "My report" })).toBeVisible();
  await expect(page.getByTestId("athlete-login")).toHaveCount(0);

  await page.goto(`/athletes/${sibling.athleteId}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page isn't here");
  for (const parentOnly of ["/athletes/new", "/consent", `/athletes/${invited.athleteId}/invite`]) {
    await page.goto(parentOnly);
    await expect(page).toHaveURL(new RegExp(`/athletes/${invited.athleteId}$`));
  }
});
