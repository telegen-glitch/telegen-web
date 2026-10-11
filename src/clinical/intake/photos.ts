import "server-only";
import { randomUUID } from "node:crypto";
import { photoSlotsFor, type PhotoSlot } from "../config/conditions";
import { asUser } from "../db";
import { logEvent } from "../log";
import { photoStorage } from "../storage";
import type { Session } from "../auth";
import { IntakeError } from "./cases";
import { stripJpegMetadata } from "./jpeg";

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

/**
 * Stores one photo for a draft case. Only the slots of the case's condition are
 * accepted (none for erectile dysfunction); metadata is stripped; a new photo
 * replaces the previous one in the same slot.
 */
export async function savePhoto(
  session: Session,
  input: { caseId: unknown; slot: unknown; bytes: Uint8Array },
): Promise<{ id: string; slot: PhotoSlot }> {
  const { caseId, slot } = input;
  if (typeof caseId !== "string" || !UUID.test(caseId) || typeof slot !== "string")
    throw new IntakeError("invalid");
  if (input.bytes.length === 0 || input.bytes.length > MAX_PHOTO_BYTES) throw new IntakeError("invalid");
  const storage = photoStorage();
  if (!storage) throw new IntakeError("closed");

  const [kase] = await asUser(actor(session), (q) =>
    q.query<{ condition: string; status: string }>(
      "select condition, status from clinical.cases where id = $1",
      [caseId],
    ),
  );
  if (!kase) throw new IntakeError("not_found");
  if (kase.status !== "draft") throw new IntakeError("locked");
  if (!photoSlotsFor(kase.condition).includes(slot as PhotoSlot)) throw new IntakeError("invalid");

  let clean: Uint8Array;
  try {
    clean = stripJpegMetadata(input.bytes);
  } catch {
    throw new IntakeError("invalid");
  }
  const objectPath = `${session.userId}/${caseId}/${slot}-${randomUUID()}.jpg`;
  try {
    await storage.put(objectPath, clean);
  } catch {
    logEvent("storage.error", { case: caseId });
    throw new IntakeError("closed");
  }

  const { id, previous } = await asUser(actor(session), async (q) => {
    const old = await q.query<{ storage_path: string }>(
      "delete from clinical.photos where case_id = $1 and slot = $2 returning storage_path",
      [caseId, slot],
    );
    const [row] = await q.query<{ id: string }>(
      "insert into clinical.photos (case_id, slot, storage_path) values ($1, $2, $3) returning id",
      [caseId, slot, objectPath],
    );
    return { id: row.id, previous: old[0]?.storage_path ?? null };
  });
  if (previous) await storage.remove(previous).catch(() => logEvent("storage.error", { case: caseId }));
  logEvent("photo.stored", { case: caseId, photo: id });
  return { id, slot: slot as PhotoSlot };
}

/** A photo the signed-in user may see (Row Level Security decides), with the read audited. */
export async function openPhoto(
  session: Session,
  photoId: string,
): Promise<{ url: string } | { bytes: Uint8Array } | null> {
  if (!UUID.test(photoId)) return null;
  const storage = photoStorage();
  if (!storage) return null;
  const row = await asUser(actor(session), async (q) => {
    const [p] = await q.query<{ storage_path: string }>(
      "select storage_path from clinical.photos where id = $1",
      [photoId],
    );
    if (p) await q.query("select clinical.audit('read', 'photos', $1)", [photoId]);
    return p;
  });
  if (!row) return null;
  const url = await storage.signedUrl(row.storage_path, 60);
  if (url) return { url };
  const bytes = await storage.read(row.storage_path);
  return bytes ? { bytes } : null;
}
