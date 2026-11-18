import { SITE } from "@/config/site";
import { siteUrl } from "@/lib/env";
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

function accountLink(): string {
  return `${siteUrl()}/account`;
}

/** Sent once when a training plan subscription starts. */
export function subscriptionStartedEmail(input: { price: string; renewsOn: string }): Content {
  return {
    subject: `Your ${SITE.name} training plan subscription has started`,
    text: sign([
      "Thanks for subscribing to the training plan.",
      `You pay ${input.price}. It renews automatically, and the next charge is on ${input.renewsOn}.`,
      "Coach-reviewed plans are still being written. Your plan page will show your athlete's plan as soon as one is ready for their sport and position.",
      `To cancel, open your Account page and choose "Cancel my training plan". It takes two clicks:\n${accountLink()}`,
    ]),
  };
}

/** Sent a few days before each renewal. */
export function renewalReminderEmail(input: { amount: string; renewsOn: string }): Content {
  return {
    subject: `Your ${SITE.name} training plan renews on ${input.renewsOn}`,
    text: sign([
      `Your training plan renews on ${input.renewsOn}, and you'll be charged ${input.amount}.`,
      "Nothing to do if you want to keep it.",
      `To stop it renewing, cancel from your Account page before then. It takes two clicks:\n${accountLink()}`,
    ]),
  };
}

/** Sent once when a subscription is cancelled. */
export function subscriptionCanceledEmail(input: { accessUntil: string | null }): Content {
  return {
    subject: `Your ${SITE.name} training plan is cancelled`,
    text: sign([
      "Your training plan subscription is cancelled. You won't be charged again.",
      input.accessUntil
        ? `You can still use the plan until ${input.accessUntil}.`
        : "Your access to the plan has ended.",
      `Your athletes' gap reports stay free, and you can subscribe again any time from your Account page:\n${accountLink()}`,
    ]),
  };
}
