import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { DemoProvider } from "@/components/demo/DemoProvider";
import { DemoShell } from "@/components/demo/DemoShell";
import { demoModeEnabled } from "@/lib/demo/config";
import { loadDemoData } from "@/lib/demo/load";

/**
 * The clickable demo. Only when DEMO_MODE=true (never on Vercel production); otherwise every /demo page
 * is a 404. No sign-in: it never reads the visitor's session, so a signed-in parent sees only the sample
 * family. It is outside the proxy's matcher, so no Supabase session check runs for it either.
 */

export const metadata: Metadata = {
  title: { default: "Demo", template: "%s | Multi-Sport Recur demo" },
  robots: { index: false, follow: false },
  manifest: "/demo/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Multi-Sport Recur", statusBarStyle: "default" },
  icons: { apple: "/demo/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#1F4E9C",
  viewportFit: "cover",
};

export default async function DemoLayout({ children }: { children: ReactNode }) {
  // Decided per request, so the same build can run with or without the demo.
  await connection();
  if (!demoModeEnabled()) notFound();

  return (
    <DemoProvider data={loadDemoData()}>
      <DemoShell>{children}</DemoShell>
    </DemoProvider>
  );
}
