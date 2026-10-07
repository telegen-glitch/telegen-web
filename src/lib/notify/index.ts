import "server-only";
import type { NotifyAdapter } from "./types";

/** Default: nothing is stored anywhere. */
const disabledAdapter: NotifyAdapter = {
  name: "disabled",
  enabled: false,
  async subscribe() {
    return { status: "disabled" };
  },
};

/**
 * Brevo (Sendinblue SAS, France; EU data hosting) — proposed EU processor.
 * Activated only when NOTIFY_ADAPTER=brevo and BREVO_API_KEY + BREVO_LIST_ID are set.
 * Requires a signed DPA with Brevo before it is switched on.
 */
function brevoAdapter(apiKey: string, listId: number): NotifyAdapter {
  return {
    name: "brevo",
    enabled: true,
    async subscribe(signup) {
      try {
        const res = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            email: signup.email,
            listIds: [listId],
            updateEnabled: true,
            attributes: {
              CONSENT_VERSION: signup.consentVersion,
              CONSENT_AT: signup.consentedAt,
            },
          }),
        });
        return res.ok || res.status === 204 ? { status: "ok" } : { status: "error" };
      } catch {
        return { status: "error" };
      }
    },
  };
}

export function getNotifyAdapter(env: NodeJS.ProcessEnv = process.env): NotifyAdapter {
  if (env.NOTIFY_ADAPTER === "brevo" && env.BREVO_API_KEY && env.BREVO_LIST_ID) {
    const listId = Number(env.BREVO_LIST_ID);
    if (Number.isInteger(listId) && listId > 0) return brevoAdapter(env.BREVO_API_KEY, listId);
  }
  return disabledAdapter;
}
