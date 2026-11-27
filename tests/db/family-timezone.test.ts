import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { adminClient, cleanUp, createFamily, type Client } from "./helpers";

/**
 * Each family's time zone. The sign-up form puts the browser's time zone in the parent's user
 * metadata; ensure_family() copies it onto the family when the parent first signs in.
 */

let admin: Client;
const leftovers: string[] = [];

beforeAll(() => {
  admin = adminClient();
});

afterAll(async () => {
  await cleanUp(admin, leftovers);
});

async function timeZoneOf(familyId: string): Promise<string | undefined> {
  return (await admin.from("families").select("timezone").eq("id", familyId).single()).data?.timezone;
}

describe("family time zone", () => {
  test("is the browser's time zone from sign-up", async () => {
    const family = await createFamily(admin, "tz-chicago", { timezone: "America/Chicago" });
    leftovers.push(family.familyId);
    expect(await timeZoneOf(family.familyId)).toBe("America/Chicago");
  });

  test("is America/New_York when sign-up sent none, or a name that isn't a real time zone", async () => {
    const none = await createFamily(admin, "tz-none");
    const madeUp = await createFamily(admin, "tz-bad", { timezone: "Mars/Olympus" });
    leftovers.push(none.familyId, madeUp.familyId);
    expect(await timeZoneOf(none.familyId)).toBe("America/New_York");
    expect(await timeZoneOf(madeUp.familyId)).toBe("America/New_York");
  });

  test("the parent can read it but not change it, and the database refuses an unknown name", async () => {
    const family = await createFamily(admin, "tz-locked", { timezone: "America/Denver" });
    leftovers.push(family.familyId);
    const own = await family.user.client.from("families").select("timezone").eq("id", family.familyId).single();
    expect(own.data?.timezone).toBe("America/Denver");

    await family.user.client.from("families").update({ timezone: "UTC" }).eq("id", family.familyId);
    expect(await timeZoneOf(family.familyId)).toBe("America/Denver");

    const bad = await admin.from("families").update({ timezone: "Not/AZone" }).eq("id", family.familyId);
    expect(bad.error?.message).toMatch(/families_timezone_is_known/);
  });
});
