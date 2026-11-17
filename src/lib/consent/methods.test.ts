import { afterEach, describe, expect, test, vi } from "vitest";
import { activeConsentMethod, CHECKBOX_FIELDS, consentMethodById } from "./methods";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("checkbox consent method", () => {
  const method = consentMethodById("checkbox_attestation");

  test("accepts when both boxes are ticked", async () => {
    expect(await method.verify(form({ [CHECKBOX_FIELDS.isGuardian]: "on", [CHECKBOX_FIELDS.agrees]: "on" }))).toBeNull();
  });

  test("says which box is missing", async () => {
    expect(await method.verify(form({ [CHECKBOX_FIELDS.agrees]: "on" }))).toContain("first box");
    expect(await method.verify(form({ [CHECKBOX_FIELDS.isGuardian]: "on" }))).toContain("second box");
    expect(await method.verify(form({}))).toContain("first box");
  });

  test("is not marked as a verified COPPA method", () => {
    expect(method.isVerifiable).toBe(false);
  });
});

describe("activeConsentMethod", () => {
  test("uses the checkbox method by default", () => {
    vi.stubEnv("CONSENT_METHOD", "");
    expect(activeConsentMethod().id).toBe("checkbox_attestation");
  });

  test("is chosen by the CONSENT_METHOD setting, and an unknown method is a loud error", () => {
    vi.stubEnv("CONSENT_METHOD", "notarised_letter");
    expect(() => activeConsentMethod()).toThrow(/Unknown consent method "notarised_letter"/);
  });
});
