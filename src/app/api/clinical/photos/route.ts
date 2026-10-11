import { NextResponse } from "next/server";
import { currentSession } from "@/clinical/auth";
import { PRIVATE_HEADERS, sameOrigin } from "@/clinical/http";
import { IntakeError } from "@/clinical/intake/cases";
import { MAX_PHOTO_BYTES, savePhoto } from "@/clinical/intake/photos";

export const dynamic = "force-dynamic";

/** Upload of one photo (multipart body: caseId, slot, file). Nothing travels in the URL. */
export async function POST(request: Request) {
  const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const session = await currentSession();
  if (!session) return json({ error: "signed_out" }, 401);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_PHOTO_BYTES + 64 * 1024)
    return json({ error: "too_large" }, 413);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof Blob) || file.type !== "image/jpeg") return json({ error: "invalid" }, 400);
  try {
    const saved = await savePhoto(session, {
      caseId: form.get("caseId"),
      slot: form.get("slot"),
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
    return json(saved);
  } catch (e) {
    const code = e instanceof IntakeError ? e.code : "error";
    return json({ error: code }, code === "closed" || code === "error" ? 503 : 400);
  }
}
