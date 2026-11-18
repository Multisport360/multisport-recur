import { randomUUID } from "node:crypto";
import { emailLinkFor, expect, signIn, test } from "./support/accounts";

/**
 * Parent accounts: sign-up, sign-in, email links, sign-out.
 * Needs the Supabase project in .env.local with the migrations applied.
 */

test("a signed-out visitor is sent to sign in, then back to where they were going", async ({ page, newParent }) => {
  await page.goto("/athletes");
  await expect(page).toHaveURL(/\/login\?next=%2Fathletes$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in");

  const parent = await newParent("signin");
  await page.getByLabel("Email").fill(parent.user.email);
  await page.getByLabel("Password").fill(parent.user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/athletes$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("My athletes");
  await expect(page.getByTestId("no-athletes")).toContainText("No athletes yet.");
});

test("sign-up says exactly what is missing before anything is sent", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create my account" }).click();

  await expect(page.getByText("Type an email address, like name@example.com.")).toBeVisible();
  await expect(page.getByText("Use at least 8 characters for the password.")).toBeVisible();
  await expect(page.getByText("Tick the box to confirm you're a parent or legal guardian aged 18 or older.")).toBeVisible();
  await expect(page.getByLabel("Your email")).toHaveAttribute("aria-invalid", "true");
});

test("sign-up keeps the email that was typed when the password is too short", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Your email").fill("parent@example.com");
  await page.getByLabel("Password").fill("short");
  await page.getByLabel(/I'm a parent or legal guardian/).check();
  await page.getByRole("button", { name: "Create my account" }).click();

  await expect(page.getByText("Use at least 8 characters for the password.")).toBeVisible();
  await expect(page.getByLabel("Your email")).toHaveValue("parent@example.com");
});

test("a wrong password says so without saying whether the account exists", async ({ page, newParent }) => {
  const parent = await newParent("wrong-password");
  await page.goto("/login");
  await page.getByLabel("Email").fill(parent.user.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("main").getByRole("alert")).toHaveText("That email and password don't match. Check both and try again.");
  await expect(page).toHaveURL(/\/login/);
});

test("an email link signs the parent in, and a used or broken link explains itself", async ({ page, admin, newParent }) => {
  const parent = await newParent("email-link");
  const link = await emailLinkFor(admin, parent.user.email);

  await page.goto(link);
  await expect(page).toHaveURL(/\/athletes$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("My athletes");

  await page.context().clearCookies();
  await page.goto(link);
  await expect(page).toHaveURL(/\/login\?problem=link$/);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "That link has expired or was already used. Sign in below, or ask for a new link.",
  );
});

test("signing out ends the session", async ({ page, newParent }) => {
  const parent = await newParent("signout");
  await signIn(page, parent.user);

  await page.goto("/account");
  await expect(page.getByText(parent.user.email)).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/athletes");
  await expect(page).toHaveURL(/\/login/);
});

test("a signed-in parent who opens the sign-in page is taken to their athletes", async ({ page, newParent }) => {
  const parent = await newParent("already-in");
  await signIn(page, parent.user);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/athletes$/);
});

test("the sign-in link never redirects off the site", async ({ page, newParent }) => {
  const parent = await newParent("open-redirect");
  await signIn(page, parent.user, "https://example.com/phish");
  await expect(page).toHaveURL(/\/athletes$/);
});

// "Confirm email" is switched off in the Supabase project (Kai's decision, Nov 2026), so a new
// parent is signed in straight away and Supabase sends no email. If it is switched on later,
// this test fails on purpose: sign-up would then go to the "Check your email" page instead.
test("creating an account signs the parent straight in and sets up their family", async ({ page, admin }) => {
  const email = `e2e-signup-${randomUUID().slice(0, 8)}@example.com`;
  try {
    await page.goto("/signup");
    await page.getByLabel("Your email").fill(email);
    await page.getByLabel("Password").fill(`pw-${randomUUID()}`);
    await page.getByLabel(/I'm a parent or legal guardian/).check();
    await page.getByRole("button", { name: "Create my account" }).click();

    await expect(page).toHaveURL(/\/athletes$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("My athletes");
    await expect(page.getByTestId("no-athletes")).toContainText("No athletes yet.");

    const users = await admin.auth.admin.listUsers({ perPage: 200 });
    const created = users.data?.users.find((user) => user.email === email);
    expect(created).toBeDefined();
    const guardian = await admin.from("guardians").select("family_id").eq("user_id", created?.id ?? "").single();
    expect(guardian.data?.family_id).toBeTruthy();
  } finally {
    // Deleting the parent's login also deletes their family (see the guardians trigger).
    const users = await admin.auth.admin.listUsers({ perPage: 200 });
    const created = users.data?.users.find((user) => user.email === email);
    if (created) await admin.auth.admin.deleteUser(created.id);
  }
});
