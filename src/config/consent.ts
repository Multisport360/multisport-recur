/**
 * Parent consent settings.
 *
 * NOT DECIDED YET: the COPPA "verifiable parental consent" method. Kai picks it.
 * Until then the method below is a plain checkbox, which is NOT a verified method
 * for children under 13. To swap it:
 *   1. add the new method to src/lib/consent/methods.ts (and its form fields to
 *      src/components/consent/ConsentFields.tsx)
 *   2. set CONSENT_METHOD in the environment, or change the default here
 *   3. bump CONSENT_VERSION if the wording parents agree to changes
 */

/** Identifies the exact wording a parent agreed to. Stored on every consent record. */
export const CONSENT_VERSION = "2026-11-draft-1";

/** Which method in src/lib/consent/methods.ts is in use. Stored on every consent record. */
export const DEFAULT_CONSENT_METHOD = "checkbox_attestation";

export function configuredConsentMethodId(): string {
  return process.env.CONSENT_METHOD?.trim() || DEFAULT_CONSENT_METHOD;
}
