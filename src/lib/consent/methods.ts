import { configuredConsentMethodId } from "@/config/consent";

/**
 * Ways a parent can give consent. The app only talks to the ConsentMethod shape,
 * so the method can be swapped without touching the pages that use it.
 */
export type ConsentMethod = {
  /** Stored in consents.method. */
  id: string;
  /** True only for a method that meets COPPA's "verifiable parental consent" standard. */
  isVerifiable: boolean;
  /**
   * Check what the parent submitted.
   * @returns null when consent was given, or a message that says what to fix.
   */
  verify(form: FormData): Promise<string | null>;
};

/** Form field names used by the checkbox method. */
export const CHECKBOX_FIELDS = {
  isGuardian: "is_guardian",
  agrees: "agrees",
} as const;

/**
 * A parent ticks two boxes. Simple, and good enough to build and test the flow,
 * but it does not verify that the person is the parent.
 */
const checkboxAttestation: ConsentMethod = {
  id: "checkbox_attestation",
  isVerifiable: false,
  async verify(form) {
    if (form.get(CHECKBOX_FIELDS.isGuardian) !== "on") {
      return "Tick the first box to confirm you are this athlete's parent or legal guardian.";
    }
    if (form.get(CHECKBOX_FIELDS.agrees) !== "on") {
      return "Tick the second box to agree before adding your athlete.";
    }
    return null;
  },
};

const METHODS: Readonly<Record<string, ConsentMethod>> = {
  [checkboxAttestation.id]: checkboxAttestation,
};

export function consentMethodById(id: string): ConsentMethod {
  const method = METHODS[id];
  if (!method) {
    throw new Error(
      `Unknown consent method "${id}". Known methods: ${Object.keys(METHODS).join(", ")}. Check CONSENT_METHOD.`,
    );
  }
  return method;
}

/** The method currently in use (from CONSENT_METHOD, or the default in src/config/consent.ts). */
export function activeConsentMethod(): ConsentMethod {
  return consentMethodById(configuredConsentMethodId());
}
