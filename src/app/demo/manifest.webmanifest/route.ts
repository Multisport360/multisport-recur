import { demoModeEnabled } from "@/lib/demo/config";

/** "Add to Home Screen" for the demo: opens /demo full screen, like an app. 404 when the demo is off. */
export function GET(): Response {
  if (!demoModeEnabled()) return new Response("Not found", { status: 404 });
  const manifest = {
    name: "Multi-Sport Recur",
    short_name: "Recur",
    description: "Demo: see what college level a sample athlete's numbers reach.",
    id: "/demo",
    start_url: "/demo",
    scope: "/demo",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F8FB",
    theme_color: "#1F4E9C",
    icons: [
      { src: "/demo/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/demo/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/demo/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
