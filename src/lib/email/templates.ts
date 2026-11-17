import { SITE } from "@/config/site";
import type { Email } from "./send";

/**
 * The words of every email the site sends. Plain functions so they can be tested.
 * Each returns the subject and the text; the caller adds who it goes to.
 */

type Content = Pick<Email, "subject" | "text">;

function sign(paragraphs: readonly string[]): string {
  return [...paragraphs, SITE.name].join("\n\n");
}

/** Sent to an athlete aged 13 or older when their parent invites them to their own login. */
export function athleteInviteEmail(input: { athleteFirstName: string; link: string }): Content {
  return {
    subject: `${input.athleteFirstName}, your parent invited you to ${SITE.name}`,
    text: sign([
      `Hi ${input.athleteFirstName},`,
      `Your parent set up ${SITE.name} for you and invited you to your own login. You'll be able to see your gap report and add your own numbers.`,
      `Open this link to choose a password:\n${input.link}`,
      "The link works once. If it has expired, ask your parent to invite you again.",
      "If you weren't expecting this, you can ignore this email.",
    ]),
  };
}
