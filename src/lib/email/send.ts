import { Resend } from "resend";
import { resendEnv } from "@/lib/env";

/**
 * Sends transactional email through Resend.
 *
 * EMAIL_FROM must be an address on a domain verified in Resend. Until one is set, the
 * Resend test sender is used, which only delivers to the Resend account owner's inbox.
 */

const TEST_SENDER = "Multi-Sport Recur <onboarding@resend.dev>";

export type Email = {
  to: string;
  subject: string;
  /** Plain text. Blank lines separate paragraphs. */
  text: string;
};

export type SendResult = { ok: true } | { ok: false; reason: string };

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A plain HTML version of the text: paragraphs, with links made clickable. */
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const withLinks = escapeHtml(paragraph).replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}">${url}</a>`);
      return `<p>${withLinks.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

/** Never throws. A failure comes back as { ok: false } with the reason, and is logged. */
export async function sendEmail(email: Email): Promise<SendResult> {
  try {
    const resend = new Resend(resendEnv().RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM?.trim() || TEST_SENDER,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: textToHtml(email.text),
    });
    if (error) {
      console.error(`[email] "${email.subject}" was not sent: ${error.message}`);
      return { ok: false, reason: error.message };
    }
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[email] "${email.subject}" was not sent: ${reason}`);
    return { ok: false, reason };
  }
}
