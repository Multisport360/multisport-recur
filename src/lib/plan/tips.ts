import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropicEnv } from "@/lib/env";
import type { BuiltPlan } from "./types";

/**
 * OPTIONAL: Claude words a few short tips AROUND a plan built from the coach-reviewed templates.
 *
 * Off unless PLAN_TIPS_FROM_CLAUDE=true. Even when on:
 *   - it only runs when a built plan exists (no plan, no call);
 *   - it never changes the plan, its exercises, or its safety notes, which are shown as the coach wrote them;
 *   - it never sees the athlete's name, and never invents or estimates a benchmark;
 *   - any failure, refusal or odd output means no tips, and the plan shows without them.
 */

const MODEL = "claude-opus-5-5";
const MAX_TIPS = 3;
const MAX_TIP_LENGTH = 240;
const MAX_TOKENS = 2000;

export function areTipsEnabled(): boolean {
  return process.env.PLAN_TIPS_FROM_CLAUDE === "true";
}

const tipsSchema = z.object({ tips: z.array(z.string().min(1).max(MAX_TIP_LENGTH)).max(MAX_TIPS) });

const SYSTEM = [
  "You write short encouragement tips that sit beside a training plan written and reviewed by a coach, for a high school athlete and their parent.",
  "Rules: Only restate or encourage what the coach's plan already says. Do not add exercises, sets, reps, loads, speeds, or schedules.",
  "Do not give medical, injury, or safety advice; the coach's safety notes cover that. Do not mention college levels, benchmarks, or numbers that are not in the plan.",
  `Write at most ${MAX_TIPS} tips, each one plain sentence under ${MAX_TIP_LENGTH} characters, in plain words a parent would use.`,
].join("\n");

export type TipsContext = { grade: number; sport: string; positionOrEvent: string };

/** Returns tips, or null when tips are off, unavailable, or not usable. Never throws. */
/** The plan in plain text for the prompt: what the coach's templates chose, week 1 day by day. */
export function planText(plan: BuiltPlan): string {
  const focus = plan.modules.map((mod) => mod.name).join(", ") || "Strength base only";
  const firstWeek = plan.weeks[0]?.days ?? [];
  const days = firstWeek.flatMap((day) =>
    day.session ? [`${day.session.title}: ${day.session.blocks.flatMap((block) => block.items.map((item) => item.name)).join("; ")}`] : [],
  );
  return [`Tier: ${plan.tierLabel}. Focus: ${focus}.`, ...days].join("\n");
}

export async function wordTips(plan: BuiltPlan, context: TipsContext): Promise<string[] | null> {
  if (!areTipsEnabled()) return null;
  try {
    const client = new Anthropic({ apiKey: anthropicEnv().ANTHROPIC_API_KEY });
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { tips: { type: "array", items: { type: "string" } } },
            required: ["tips"],
            additionalProperties: false,
          },
        },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Athlete: grade ${context.grade}, ${context.sport}, ${context.positionOrEvent}.\n\nCoach-reviewed plan:\n${planText(plan)}`,
        },
      ],
    });
    if (response.stop_reason !== "end_turn") return null;
    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") return null;
    const parsed = tipsSchema.safeParse(JSON.parse(text.text));
    return parsed.success && parsed.data.tips.length > 0 ? parsed.data.tips : null;
  } catch (error) {
    console.error(`[plan tips] skipped: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
