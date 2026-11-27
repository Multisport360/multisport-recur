import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { atkinson, bigShoulders } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#F6F8FB",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
