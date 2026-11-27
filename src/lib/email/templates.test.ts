import { describe, expect, test } from "vitest";
import { textToHtml } from "./send";
import { athleteInviteEmail } from "./templates";

describe("athleteInviteEmail", () => {
  const email = athleteInviteEmail({ athleteFirstName: "Sam", link: "https://example.com/auth/confirm?token_hash=abc&type=invite" });

  test("names the athlete and says a parent sent it", () => {
    expect(email.subject).toBe("Sam, your parent invited you to Multi-Sport Recur");
    expect(email.text).toContain("Your parent set up Multi-Sport Recur for you");
  });

  test("includes the link on its own line", () => {
    expect(email.text).toContain("\nhttps://example.com/auth/confirm?token_hash=abc&type=invite");
  });
});

describe("textToHtml", () => {
  test("turns paragraphs into <p> and links into <a>", () => {
    expect(textToHtml("Hi Sam,\n\nOpen this:\nhttps://example.com/a?b=1&c=2")).toBe(
      '<p>Hi Sam,</p>\n<p>Open this:<br><a href="https://example.com/a?b=1&amp;c=2">https://example.com/a?b=1&amp;c=2</a></p>',
    );
  });

  test("escapes anything that looks like HTML", () => {
    expect(textToHtml('<script>alert("x")</script>')).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
  });
});
