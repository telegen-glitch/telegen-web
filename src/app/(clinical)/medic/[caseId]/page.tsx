import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DECLINE_REASONS, doctorCase } from "@/clinical/doctor/workflow";
import { staffGate } from "@/clinical/staff";
import { DoctorPanel } from "@/clinical/ui/DoctorPanel";
import { conditionName, DOCTOR_STATUS, slaText } from "@/clinical/ui/labels";
import { Messages } from "@/clinical/ui/Messages";
import { Card, Screen } from "@/clinical/ui/parts";
import { StaffGateView } from "@/clinical/ui/StaffGateView";

export const metadata: Metadata = { title: "Caz", robots: { index: false, follow: false } };

const SLOT: Record<string, string> = { front: "Din față", top: "De sus", crown: "Creștetul", face: "Fața" };

export default async function DoctorCasePage({ params }: PageProps<"/medic/[caseId]">) {
  const gate = await staffGate("doctor");
  if (gate.state !== "ok") return <StaffGateView gate={gate} title="Panoul medicului" />;
  const { caseId } = await params;
  if (!/^[0-9a-f-]{36}$/.test(caseId)) notFound();
  const view = await doctorCase(gate.session, caseId);
  if (!view) notFound();
  return (
    <Screen wide>
      <Link href="/medic" className="text-sm font-semibold text-blue-700 underline underline-offset-2">
        Înapoi la coadă
      </Link>
      <h1 className="mt-4 text-display-2">
        {conditionName(view.condition)}
        {view.test && (
          <span className="ml-3 rounded-md bg-mist px-2 py-1 align-middle text-sm text-ink-soft">TEST</span>
        )}
      </h1>
      <p className="mt-2 text-ink-soft">
        {DOCTOR_STATUS[view.status]} · termen: {slaText(view.slaDueAt, view.status === "waiting_patient")}
        {view.patientName && ` · pacient: ${view.patientName}`}
      </p>

      <section aria-labelledby="raspunsuri" className="mt-8">
        <h2 id="raspunsuri" className="text-xl font-semibold text-navy-950">
          Răspunsurile pacientului
        </h2>
        <dl className="mt-3 divide-y divide-line-soft rounded-card bg-white px-5 shadow-[var(--shadow-card)]">
          {view.answers.map((a) => (
            <div key={a.question} className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6">
              <dt className="text-sm text-ink-muted">{a.question}</dt>
              <dd className="font-medium break-words text-navy-950">{a.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {view.photos.length > 0 && (
        <section aria-labelledby="fotografii" className="mt-8">
          <h2 id="fotografii" className="text-xl font-semibold text-navy-950">
            Fotografii
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {view.photos.map((p) => (
              <li key={p.id}>
                <a href={`/api/clinical/photos/${p.id}`} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- private photo through a 60-second link */}
                  <img
                    src={`/api/clinical/photos/${p.id}`}
                    alt={`Fotografie: ${SLOT[p.slot] ?? p.slot}`}
                    className="aspect-square w-full rounded-xl bg-mist object-cover"
                  />
                  <span className="mt-1 block text-sm text-ink-soft">{SLOT[p.slot] ?? p.slot}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.plan && view.proposal && (
        <Card className="mt-8">
          <p className="text-sm text-ink-muted">Planul ales de pacient</p>
          <p className="mt-1 text-lg font-semibold text-navy-950">{view.plan.title}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {view.proposal.billing === "monthly" ? "Lunar" : "La 3 luni"} · prima plată{" "}
            {view.proposal.firstAmount} lei, apoi {view.proposal.recurringAmount} lei
          </p>
        </Card>
      )}

      <DoctorPanel view={view} reasons={DECLINE_REASONS} />
      <Messages
        caseId={view.id}
        messages={view.messages}
        me="doctor"
        canSend={view.mine && view.status !== "submitted"}
      />
    </Screen>
  );
}
