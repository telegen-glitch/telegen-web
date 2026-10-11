"use client";

import { useState } from "react";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { PHOTO_SLOTS, type PhotoSlot } from "../config/conditions";
import { Card, ErrorText } from "./parts";

const MAX_SIDE = 1600;

/**
 * Re-encodes a photo in the browser: at most 1600 px, JPEG, and no metadata
 * (a canvas carries no EXIF, so location and device data never leave the phone).
 */
async function reencode(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85),
  );
}

export interface SavedPhoto {
  id: string;
  slot: PhotoSlot;
  /** Local preview of a photo taken in this visit. */
  preview?: string;
}

export function PhotoStep({
  caseId,
  slots,
  saved,
  onSaved,
  onDone,
}: {
  caseId: string;
  slots: PhotoSlot[];
  saved: SavedPhoto[];
  onSaved: (p: SavedPhoto) => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<PhotoSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const done = slots.every((s) => saved.some((p) => p.slot === s));

  const upload = async (slot: PhotoSlot, file: File | undefined) => {
    if (!file) return;
    setBusy(slot);
    setError(null);
    try {
      const blob = await reencode(file);
      const body = new FormData();
      body.set("caseId", caseId);
      body.set("slot", slot);
      body.set("file", blob, "photo.jpg");
      const res = await fetch("/api/clinical/photos", { method: "POST", body, credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { id: string; slot: PhotoSlot };
      onSaved({ id: data.id, slot: data.slot, preview: URL.createObjectURL(blob) });
    } catch {
      setError("Nu am putut salva fotografia. Încearcă din nou, cu o fotografie JPEG sau PNG.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <ul className="mt-8 space-y-3">
        {slots.map((slot) => {
          const info = PHOTO_SLOTS[slot];
          const photo = saved.find((p) => p.slot === slot);
          const inputId = `foto-${slot}`;
          return (
            <li key={slot}>
              <Card className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element -- private photo, never optimised or cached
                    <img
                      src={photo.preview ?? `/api/clinical/photos/${photo.id}`}
                      alt={`Fotografia ta: ${info.title.toLowerCase()}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-950">
                    {info.title}
                    {photo && <span className="ml-2 text-sm font-medium text-blue-700">Salvată</span>}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{info.how}</p>
                  <label
                    htmlFor={inputId}
                    className={buttonClasses(photo ? "secondary" : "primary", "md", "mt-3 cursor-pointer")}
                  >
                    {busy === slot
                      ? "Se salvează…"
                      : photo
                        ? "Schimbă fotografia"
                        : "Fă sau alege o fotografie"}
                  </label>
                  <input
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    className="sr-only"
                    disabled={busy !== null}
                    onChange={(e) => {
                      void upload(slot, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
      <button
        type="button"
        disabled={!done || busy !== null}
        onClick={onDone}
        className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
      >
        Continuă <Arrow />
      </button>
    </>
  );
}
