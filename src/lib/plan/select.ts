import type { FocusModule, TemplateLibrary, TierId } from "./library-schema.ts";
import { statLinkFor } from "./metric-map.ts";
import type { ChosenModule, ScreenAnswers, StatGap } from "./types.ts";

/** plan_rules: "Pick at most 2 focus modules". */
export const MAX_FOCUS_MODULES = 2;

/** All 8th graders get Foundation; otherwise a year of coached strength training means Development. */
export function chooseTier(grade: number, screens: Pick<ScreenAnswers, "hasTrainingAge">): TierId {
  if (grade <= 8) return "foundation";
  return screens.hasTrainingAge ? "development" : "foundation";
}

/** Gap as a share of the next level's number, so seconds, mph and inches can be compared. */
export function gapShare(gap: StatGap): number {
  return gap.nextLevelEntry > 0 ? gap.gap / gap.nextLevelEntry : 0;
}

function moduleForStat(library: TemplateLibrary, forStat: string): FocusModule | undefined {
  return library.focus_modules.find((mod) => mod.for_stats.includes(forStat));
}

/**
 * The focus modules for the stats with the biggest gap to the next level. Height and weight
 * never pick a module. Several stats can point at one module (40-yard dash and 100 m both pick
 * Sprint speed); the module then counts its biggest gap. Ties keep the order of the gap report.
 */
export function chooseModules(library: TemplateLibrary, gaps: readonly StatGap[]): ChosenModule[] {
  const byModule = new Map<string, ChosenModule>();
  for (const gap of gaps) {
    const link = statLinkFor(gap.metric);
    if (link?.kind !== "trainable") continue;
    const mod = moduleForStat(library, link.forStat);
    if (!mod) continue;
    const share = gapShare(gap);
    const existing = byModule.get(mod.id);
    byModule.set(mod.id, {
      id: mod.id,
      name: mod.name,
      goal: mod.goal,
      addedTo: mod.added_to,
      gaps: [...(existing?.gaps ?? []), gap].sort((a, b) => gapShare(b) - gapShare(a)),
      gapShare: Math.max(existing?.gapShare ?? 0, share),
    });
  }
  return [...byModule.values()].sort((a, b) => b.gapShare - a.gapShare).slice(0, MAX_FOCUS_MODULES);
}

/** The not_trainable messages for height and weight gaps on the report. */
export function notTrainableMessages(library: TemplateLibrary, gaps: readonly StatGap[]): string[] {
  const stats = new Set(gaps.map((gap) => statLinkFor(gap.metric)).flatMap((link) => (link?.kind === "not_trainable" ? [link.stat] : [])));
  return library.not_trainable.filter((entry) => stats.has(entry.stat)).map((entry) => entry.message);
}
