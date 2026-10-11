/**
 * Shown when the clinical service is not configured yet (e.g. Supabase keys
 * missing). Visitors only ever see the calm message. On non-production previews
 * a small technical note names what is missing (variable names, never values),
 * so the owner knows what to add. Production never renders the note.
 */
export const SERVICE_NOT_READY = "Serviciul se pregătește. Revino în câteva minute.";

export function ServiceNotReady({ detail }: { detail: string | null }) {
  return (
    <div className="mt-8" role="status">
      <p className="text-lead text-ink-soft">{SERVICE_NOT_READY}</p>
      {detail && (
        <p className="mt-3 text-xs text-ink-muted" data-owner-note="">
          Notă tehnică, doar pe preview: lipsește {detail}. Vezi docs/LAUNCH.md.
        </p>
      )}
    </div>
  );
}
