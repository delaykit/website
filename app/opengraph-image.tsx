import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "DelayKit. Durable wake-ups for TypeScript apps and agents.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [crimsonBold, jetbrainsRegular] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/CrimsonPro-Bold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/JetBrainsMono-Regular.ttf")),
  ]);

  const ink = "#f0e5cb";
  const paper = "#1a1410";
  const stamp = "#e85a4f";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: paper,
          color: ink,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "Crimson Pro",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.018em",
          }}
        >
          DelayKit
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ display: "flex" }}>Durable wake-ups</div>
          <div style={{ display: "flex" }}>for TypeScript apps</div>
          <div style={{ display: "flex" }}>and agents.</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "JetBrains Mono",
            fontSize: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: stamp }}>$</span>
            <span style={{ marginLeft: 18 }}>npm install delaykit</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 64,
            }}
          >
            <span style={{ color: stamp }}>$</span>
            <span style={{ marginLeft: 18 }}>bun add delaykit</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Crimson Pro",
          data: crimsonBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "JetBrains Mono",
          data: jetbrainsRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
