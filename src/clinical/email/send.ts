import "server-only";
import { asService } from "../db";
import { clinicalEnv } from "../env";
import { logEvent } from "../log";
import { templates, type TemplateName } from "./templates";

const AREA: Record<string, string> = {
  patient: "/cont",
  doctor: "/medic",
  pharmacy: "/farmacie",
  admin: "/admin",
};

/**
 * Sends queued e-mails through Brevo (EU). The text comes only from the
 * template, the recipient's first name and a link to their area: never health
 * data. Without Brevo (local development, CI) e-mails stay in the outbox.
 */
export async function deliverPending(limit = 25): Promise<{ sent: number; failed: number }> {
  const env = clinicalEnv();
  if (!env.brevo) return { sent: 0, failed: 0 };
  const rows = await asService((q) =>
    q.query<{ id: number; template: string; email: string; role: string; full_name: string | null }>(
      `select o.id, o.template, p.email, p.role, pt.full_name
       from clinical.outbox o join clinical.profiles p on p.id = o.to_profile_id
       left join clinical.patients pt on pt.id = p.id
       where o.sent_at is null and o.error is null order by o.id limit $1`,
      [limit],
    ),
  );
  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const render = templates[row.template as TemplateName];
    if (!render) continue;
    const mail = render({
      firstName: row.role === "patient" ? (row.full_name?.split(" ")[0] ?? null) : null,
      link: `${env.appUrl}${AREA[row.role] ?? "/cont"}`,
    });
    let ok = false;
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": env.brevo.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: env.brevo.senderEmail, name: env.brevo.senderName },
          to: [{ email: row.email }],
          subject: mail.subject,
          textContent: mail.text,
        }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    await asService((q) =>
      q.query(
        ok
          ? "update clinical.outbox set sent_at = now() where id = $1"
          : "update clinical.outbox set error = 'send_failed' where id = $1",
        [row.id],
      ),
    );
    if (ok) sent += 1;
    else failed += 1;
    logEvent(ok ? "email.sent" : "email.error", { outbox: String(row.id).padStart(8, "0") });
  }
  return { sent, failed };
}
