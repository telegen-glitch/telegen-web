import "server-only";
import type { Executor } from "../db";
import type { templates } from "./templates";

export type TemplateName = keyof typeof templates;

/**
 * Queues an e-mail: a template name and opaque ids only. The text is rendered
 * when it is sent (src/clinical/email/send.ts), from the template and a link
 * into the account, never from health data.
 */
export async function enqueue(
  q: Executor,
  toProfileId: string,
  template: TemplateName,
  refId: string | null,
) {
  await q.query("insert into clinical.outbox (to_profile_id, template, ref_id) values ($1, $2, $3)", [
    toProfileId,
    template,
    refId,
  ]);
}
