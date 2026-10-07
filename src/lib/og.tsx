import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

/**
 * Branded Open Graph image (§v4.C7): eyebrow + title + wordmark on navy.
 * Callers never pass a medicine name for condition or medicine pages.
 */
export async function renderOg({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [sans, sansExt, serif, serifExt] = await Promise.all([
    font("instrument-sans-600-latin.woff"),
    font("instrument-sans-600-latin-ext.woff"),
    font("newsreader-italic-latin.woff"),
    font("newsreader-italic-latin-ext.woff"),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a1631",
        color: "#ffffff",
        padding: "72px 80px",
        fontFamily: "Instrument Sans",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{ width: 34, height: 34, borderRadius: 999, border: "6px solid #ffffff", display: "flex" }}
        />
        <div style={{ fontSize: 40, letterSpacing: -1.5 }}>telegen</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 26, color: "#c4d4f3", textTransform: "uppercase", letterSpacing: 2 }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: title.length > 40 ? 64 : 76,
            lineHeight: 1.05,
            letterSpacing: -2.5,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ fontFamily: "Newsreader", fontStyle: "italic", fontSize: 32, color: "#c4d4f3" }}>
        Clinică online pentru sănătatea bărbaților
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Instrument Sans", data: sans, weight: 600, style: "normal" },
        { name: "Instrument Sans", data: sansExt, weight: 600, style: "normal" },
        { name: "Newsreader", data: serif, weight: 400, style: "italic" },
        { name: "Newsreader", data: serifExt, weight: 400, style: "italic" },
      ],
    },
  );
}
