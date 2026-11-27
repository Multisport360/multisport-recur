import { afterAll, beforeAll, expect, test } from "vitest";
import { addAthlete, adminClient, cleanUp, createFamily, type Client } from "./helpers";

/** Deleting a family's last parent login deletes the family and everything in it. */

let admin: Client;
const leftovers: string[] = [];

beforeAll(() => {
  admin = adminClient();
});

afterAll(async () => {
  await cleanUp(admin, leftovers);
});

test("removing the last parent login removes the family, its athletes and their numbers", async () => {
  const family = await createFamily(admin, "lifecycle");
  leftovers.push(family.familyId);
  const { athleteId, statId } = await addAthlete(family, "Pat", new Date().getFullYear() - 15);

  const deleted = await admin.auth.admin.deleteUser(family.user.id);
  expect(deleted.error).toBeNull();

  expect((await admin.from("families").select("id").eq("id", family.familyId)).data).toEqual([]);
  expect((await admin.from("athletes").select("id").eq("id", athleteId)).data).toEqual([]);
  expect((await admin.from("stat_entries").select("id").eq("id", statId)).data).toEqual([]);
  expect((await admin.from("consents").select("id").eq("family_id", family.familyId)).data).toEqual([]);
});
