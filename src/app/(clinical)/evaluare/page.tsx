import { decidingDoctor } from "@/content/clinicians";
import { evaluations } from "@/content/evaluations";
import { content } from "@/content/source";
import { authAdapter } from "@/clinical/auth";
import { DEV_CODE } from "@/clinical/auth/dev";
import { photoSlotsFor } from "@/clinical/config/conditions";
import { ensureAccount } from "@/clinical/intake/account";
import { consentsCurrent, latestDraft } from "@/clinical/intake/cases";
import { IntakeFlow } from "@/clinical/ui/IntakeFlow";
import { notReadyDetail, purchasableTopics } from "@/clinical/launch";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/evaluare");

export default async function EvaluationPage() {
  const auth = authAdapter();
  const allowed = purchasableTopics();
  const session = auth ? await auth.session() : null;
  let account: { email: string; consented: boolean } | null = null;
  let draft = null;
  if (session && (await ensureAccount(session)) === "patient") {
    account = { email: session.email, consented: await consentsCurrent(session) };
    draft = await latestDraft(session, allowed);
  }
  return (
    <IntakeFlow
      // Every published condition can be evaluated (CLAUDE.md v5.1); price and the
      // service switch only change the end of the flow.
      topics={evaluations
        .filter((e) => content.getCondition(e.topic))
        .map((e) => ({
          slug: e.topic,
          name: e.name,
          href: content.getCondition(e.topic)?.basePath,
          decider: decidingDoctor(e.topic),
          photoSlots: photoSlotsFor(e.topic),
          purchasable: allowed.includes(e.topic),
        }))}
      account={account}
      draft={draft}
      authReady={auth !== null}
      devCode={auth?.kind === "dev" ? DEV_CODE : null}
      notReadyDetail={notReadyDetail()}
    />
  );
}
