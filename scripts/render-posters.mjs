/**
 * Renders the calm final frame of each WebGL panel scene into a static poster
 * (AVIF + WebP) in public/posters. The poster is what visitors see in closed
 * panels, before a scene loads, with reduced motion, without WebGL and with
 * Save-Data. Run after changing a scene: pnpm render:posters
 *
 * The scene sources are transpiled with TypeScript and run in headless Chromium
 * (Playwright), so the poster is pixel-for-pixel the real scene.
 */
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import ts from "typescript";

const DIR = "src/components/home/panels/scenes";
const OUT = "public/posters";
const WIDTH = 1400;
const HEIGHT = 560;
/** Story time of the poster frame: long after the story, in the calm state. */
const CALM_T = 30;

export function sceneSource(name) {
  const js = (file) =>
    ts
      .transpileModule(readFileSync(`${DIR}/${file}.ts`, "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      })
      .outputText.replace(/^import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
      .replace(/^export\s+/gm, "");
  return `(() => {\n${js("gl")}\n${js(name)}\nwindow.__create = create;\n})();`;
}

export async function renderFrame(page, name, t, { width = WIDTH, height = HEIGHT, quality = "high" } = {}) {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html><body style="margin:0"><canvas id="c" style="display:block;width:${width}px;height:${height}px"></canvas></body>`,
  );
  await page.addScriptTag({ content: sceneSource(name) });
  return page.evaluate(
    ([t, quality]) => {
      const canvas = document.getElementById("c");
      const scene = window.__create(canvas, { quality, dprCap: 1, preserve: true, allowSoftware: true });
      if (!scene) throw new Error("WebGL2 unavailable");
      scene.render(t);
      const url = canvas.toDataURL("image/png");
      scene.dispose();
      return url;
    },
    [t, quality],
  );
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const name of ["hair", "skin"]) {
    const url = await renderFrame(page, name, CALM_T);
    const png = Buffer.from(url.split(",")[1], "base64");
    await sharp(png).webp({ quality: 70, effort: 6 }).toFile(`${OUT}/${name}.webp`);
    await sharp(png).avif({ quality: 46, effort: 6 }).toFile(`${OUT}/${name}.avif`);
    console.log(`${OUT}/${name}.{avif,webp}`);
  }
  await browser.close();
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
