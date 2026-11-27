import { parseTemplateLibrary, type ReviewStatus, type TemplateLibrary } from "./library-schema.ts";

/**
 * Turning a plan_templates row into a template library the builder can use, and the rule
 * for when a draft (not coach-reviewed) library may be shown at all.
 */

export type LoadedLibrary = { version: string; reviewStatus: ReviewStatus; library: TemplateLibrary };

export type PlanTemplateRecord = {
  version: string;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_on: string | null;
  content: unknown;
};

/**
 * Draft templates may show only when BOTH hold:
 *   - ALLOW_DRAFT_PLANS is exactly "true", and
 *   - this is not a production build (`next build` sets NODE_ENV to "production", on Vercel and
 *     with `next start` alike), so no deployed site can ever show a draft, even with the flag set.
 * Arguments default to the real environment; tests pass their own.
 */
export function draftPlansAllowed(nodeEnv: string | undefined = process.env.NODE_ENV, flag: string | undefined = process.env.ALLOW_DRAFT_PLANS): boolean {
  return nodeEnv !== "production" && flag === "true";
}

/**
 * The row's columns are what count for review: the coach approves a library by changing
 * review_status, reviewed_by and reviewed_on on the row. They replace the same fields in the
 * stored JSON before it is checked, so the two can never disagree.
 */
export function libraryFromRecord(record: PlanTemplateRecord): LoadedLibrary {
  const content = typeof record.content === "object" && record.content !== null ? record.content : {};
  const library = parseTemplateLibrary({
    ...content,
    version: record.version,
    review_status: record.review_status,
    ...(record.reviewed_by ? { reviewed_by: record.reviewed_by } : {}),
    ...(record.reviewed_on ? { reviewed_on: record.reviewed_on } : {}),
  });
  return { version: record.version, reviewStatus: record.review_status, library };
}

/** Which library to use: an approved one always; a draft only when drafts are allowed. */
export function pickLibrary(
  approved: PlanTemplateRecord | null,
  draft: PlanTemplateRecord | null,
  allowDrafts: boolean,
): PlanTemplateRecord | null {
  if (approved?.review_status === "approved") return approved;
  if (allowDrafts && draft?.review_status === "draft") return draft;
  return null;
}
