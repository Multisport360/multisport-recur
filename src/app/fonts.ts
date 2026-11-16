import { Atkinson_Hyperlegible_Next, Big_Shoulders } from "next/font/google";

/*
  CLAUDE.md names "Big Shoulders Display". Google Fonts has since folded the Display cut
  into one family, "Big Shoulders", with an optical-size axis (opsz 10-72). Loading the
  opsz axis gives the Display drawing at heading sizes, which is the look the rules ask for.
*/
export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  // Next has no fallback metrics for this family, so skip the generated fallback face.
  adjustFontFallback: false,
  variable: "--font-big-shoulders",
});

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-atkinson",
});
