import { ImageResponse } from "next/og";
import { demoModeEnabled } from "@/lib/demo/config";

/**
 * Home-screen icons for the demo: an "MR" monogram over a ruler, lane-white on track-blue.
 * Drawn as shapes, so no font file is needed. The maskable icon is shrunk to stay inside the
 * circle Android may cut it to. 404 when the demo is off.
 */

const TRACK_BLUE = "#1F4E9C";
const LANE_WHITE = "#F6F8FB";

const ICONS: Record<string, { size: number; scale: number }> = {
  "icon-192.png": { size: 192, scale: 1 },
  "icon-512.png": { size: 512, scale: 1 },
  "maskable-512.png": { size: 512, scale: 0.8 },
  "apple-touch-icon.png": { size: 180, scale: 1 },
};

function Monogram({ size, scale }: { size: number; scale: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill={TRACK_BLUE} />
      <g transform={`translate(50 50) scale(${scale}) translate(-50 -50)`} fill={LANE_WHITE}>
        {/* M */}
        <polygon points="20,66 20,28 28,28 34,47 40,28 48,28 48,66 41,66 41,44 36,59 32,59 27,44 27,66" />
        {/* R, with its counter cut out */}
        <path
          fillRule="evenodd"
          d="M53 66 V28 H67 C74 28 78 32.5 78 40 C78 45.5 75 49.5 70 50.5 L79 66 H71 L63 51 H60 V66 Z M60 35 V44.5 H66 C69 44.5 71 42.5 71 39.75 C71 37 69 35 66 35 Z"
        />
        {/* The ruler: a base line with level ticks */}
        <rect x="20" y="76" width="59" height="3" />
        <rect x="20" y="71" width="2.5" height="8" />
        <rect x="39" y="72.5" width="2.5" height="6.5" />
        <rect x="58" y="72.5" width="2.5" height="6.5" />
        <rect x="76.5" y="71" width="2.5" height="8" />
      </g>
    </svg>
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }): Promise<Response> {
  if (!demoModeEnabled()) return new Response("Not found", { status: 404 });
  const icon = ICONS[(await params).name];
  if (!icon) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: TRACK_BLUE }}>
        <Monogram size={icon.size} scale={icon.scale} />
      </div>
    ),
    { width: icon.size, height: icon.size },
  );
}
