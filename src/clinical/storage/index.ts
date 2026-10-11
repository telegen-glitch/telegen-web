import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { secretKeyHeaders } from "@/lib/supabase-env";
import { clinicalEnv } from "../env";

/**
 * Private photo storage (CLAUDE.md v5). Supabase Storage in a private bucket,
 * reached only from the server with the service key after a Row Level Security
 * check on the photo record; viewers get a signed URL valid for 60 seconds.
 * Locally (never on Vercel) photos are files under .data/photos.
 */
export interface PhotoStorage {
  readonly kind: "supabase" | "local";
  put(objectPath: string, bytes: Uint8Array): Promise<void>;
  remove(objectPath: string): Promise<void>;
  /** A short-lived URL, or null when the bytes are served by read() instead. */
  signedUrl(objectPath: string, seconds: number): Promise<string | null>;
  read(objectPath: string): Promise<Uint8Array | null>;
}

const BUCKET = "case-photos";
const SAFE_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[a-z]+-[0-9a-f-]{36}\.jpg$/;

function checkPath(objectPath: string) {
  if (!SAFE_PATH.test(objectPath)) throw new Error("unsafe storage path");
}

function supabaseStorage(config: { url: string; secretKey: string }): PhotoStorage {
  const headers = secretKeyHeaders(config.secretKey);
  return {
    kind: "supabase",
    async put(objectPath, bytes) {
      checkPath(objectPath);
      const res = await fetch(`${config.url}/storage/v1/object/${BUCKET}/${objectPath}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "image/jpeg", "x-upsert": "false" },
        body: Buffer.from(bytes),
      });
      if (!res.ok) throw new Error(`storage put ${res.status}`);
    },
    async remove(objectPath) {
      checkPath(objectPath);
      await fetch(`${config.url}/storage/v1/object/${BUCKET}`, {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [objectPath] }),
      });
    },
    async signedUrl(objectPath, seconds) {
      checkPath(objectPath);
      const res = await fetch(`${config.url}/storage/v1/object/sign/${BUCKET}/${objectPath}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: seconds }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { signedURL?: string };
      return data.signedURL ? `${config.url}/storage/v1${data.signedURL}` : null;
    },
    async read() {
      return null;
    },
  };
}

function localStorageDir(): PhotoStorage {
  const root = path.join(process.cwd(), ".data", "photos");
  const file = (p: string) => {
    checkPath(p);
    return path.join(root, p);
  };
  return {
    kind: "local",
    async put(objectPath, bytes) {
      const f = file(objectPath);
      await mkdir(path.dirname(f), { recursive: true });
      await writeFile(f, bytes);
    },
    async remove(objectPath) {
      await rm(file(objectPath), { force: true });
    },
    async signedUrl() {
      return null;
    },
    async read(objectPath) {
      try {
        return new Uint8Array(await readFile(file(objectPath)));
      } catch {
        return null;
      }
    },
  };
}

export function photoStorage(): PhotoStorage | null {
  const env = clinicalEnv();
  if (env.supabase) return supabaseStorage(env.supabase);
  if (env.localDrivers) return localStorageDir();
  return null;
}
