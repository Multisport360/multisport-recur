import type { PlanTemplateRow } from "@/lib/supabase/database.types";

/**
 * Picking a coach-reviewed plan template for an athlete. Training plans come ONLY from
 * published plan_templates rows. If none matches, the page says the plan is coming.
 * Nothing here writes, invents or adapts a plan.
 */

export type PlanSection = { heading: string; items: string[] };

export type PlanTemplate = {
  id: string;
  sport: string;
  positionOrEvent: string | null;
  metric: string | null;
  minGrade: number;
  maxGrade: number;
  title: string;
  summary: string;
  sections: PlanSection[];
  safetyNotes: string;
};

/** Below this grade, throwing-velocity plans carry extra caution (CLAUDE.md legal rules). */
export const THROWING_CAUTION_BELOW_GRADE = 11;

export const THROWING_CAUTION =
  "Extra caution for younger throwers: arms are still growing. Follow pitch-count and rest-day limits for your athlete's age, stop any throwing that causes pain in the elbow or shoulder, and check with a coach or doctor before adding velocity work.";

/** Reads the coach's plan body. Anything that isn't a list of { heading, items } is left out, never guessed at. */
function readSections(body: unknown): PlanSection[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((section) => {
    if (typeof section !== "object" || section === null) return [];
    const { heading, items } = section as { heading?: unknown; items?: unknown };
    if (typeof heading !== "string" || !Array.isArray(items)) return [];
    return [{ heading, items: items.filter((item): item is string => typeof item === "string") }];
  });
}

export function toPlanTemplate(row: PlanTemplateRow): PlanTemplate | null {
  if (!row.is_published || !row.reviewed_by || !row.reviewed_at) return null;
  return {
    id: row.id,
    sport: row.sport,
    positionOrEvent: row.position_or_event,
    metric: row.metric,
    minGrade: row.min_grade,
    maxGrade: row.max_grade,
    title: row.title,
    summary: row.summary,
    sections: readSections(row.body),
    safetyNotes: row.safety_notes,
  };
}

/**
 * Templates that fit an athlete's sport, position and grade. A template with no position
 * fits every position in its sport. Position-specific templates come first.
 */
export function matchTemplates(
  templates: readonly PlanTemplate[],
  athleteSport: { sport: string; positionOrEvent: string },
  grade: number,
): PlanTemplate[] {
  return templates
    .filter(
      (template) =>
        template.sport === athleteSport.sport &&
        (template.positionOrEvent === null || template.positionOrEvent === athleteSport.positionOrEvent) &&
        grade >= template.minGrade &&
        grade <= template.maxGrade,
    )
    .sort((a, b) => Number(b.positionOrEvent !== null) - Number(a.positionOrEvent !== null));
}

/** True when the plan works on throwing velocity and the athlete is in a younger grade. */
export function needsThrowingCaution(template: PlanTemplate, grade: number): boolean {
  const isThrowing = /velocity|throw/i.test(`${template.metric ?? ""} ${template.title}`);
  return isThrowing && template.sport === "Baseball" && grade < THROWING_CAUTION_BELOW_GRADE;
}
