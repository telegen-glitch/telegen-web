import { existsSync } from "node:fs";
import path from "node:path";
import { heroMedia, type HeroMedia } from "./flags";

/** Server only: resolves the hero media switch against the files actually present. */

export const HAIR_PHOTO_FILES = [
  "hair-portrait.avif",
  "hair-portrait.webp",
  "hair-portrait.jpg",
  "hair-wide.avif",
  "hair-wide.webp",
  "hair-wide.jpg",
] as const;

const publicFile = (name: string) => existsSync(path.join(process.cwd(), "public/media/hero", name));

/** "photo" only when the switch asks for it and every file exists; otherwise "illustration". */
export function resolveHeroMedia(
  wanted: HeroMedia,
  files: readonly string[],
  exists: (name: string) => boolean = publicFile,
): HeroMedia {
  return wanted === "photo" && files.every(exists) ? "photo" : "illustration";
}

export function hairHeroMedia(): HeroMedia {
  return resolveHeroMedia(heroMedia.hair, HAIR_PHOTO_FILES);
}
