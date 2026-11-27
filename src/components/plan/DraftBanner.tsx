/**
 * Shown at the top of every page that uses a draft (not coach-reviewed) template library.
 * Drafts only ever appear in local development with ALLOW_DRAFT_PLANS=true, and in the demo
 * (/demo, only when DEMO_MODE=true) for the sample athlete.
 */
export function DraftBanner() {
  return (
    <p data-testid="draft-banner" role="note" className="mb-3 border-2 border-infield-navy bg-chalk px-2 py-1.5 font-bold">
      Sample plan, not coach-reviewed. For testing only.
    </p>
  );
}
