import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authAdapter } from "@/clinical/auth";
import { patientCase } from "@/clinical/patient/case";
import { AdjustmentAnswer } from "@/clinical/ui/AdjustmentAnswer";
import { conditionName } from "@/clinical/ui/labels";
import { Messages } from "@/clinical/ui/Messages";
import { Card, Screen } from "@/clinical/ui/parts";
import { PATIENT_STATUS } from "@/clinical/ui/status";

export const metadata: Metadata = { title: "Evaluarea ta", robots: { index: false, follow: false } };

const ORDER: Record<string, string> = {
  pending: "Rețeta a ajuns la farmacie",
  packing: "Farmacia pregătește coletul",
  shipped: "Coletul a plecat",
  delivered: "Livrat",
  canceled: "Comandă anulată",
};

export default async function PatientCasePage({ params }: PageProps<"/cont/[caseId]">) {
  const session = await authAdapter()?.session();
  if (!session) return notFound();
  const { caseId } = await params;
  if (!/^[0-9a-f-]{36}$/.test(caseId)) notFound();
  const view = await patientCase(session, caseId);
  if (!view) notFound();
  return (
    <Screen wide>
      <Link href="/cont" className="text-sm font-semibold text-blue-700 underline underline-offset-2">
        Înapoi la cont
      </Link>
      <h1 className="mt-4 text-display-2">
        {conditionName(view.condition)}
        {view.test && (
          <span className="ml-3 rounded-md bg-mist px-2 py-1 align-middle text-sm text-ink-soft">TEST</span>
        )}
      </h1>
      <p className="mt-2 text-lead">{PATIENT_STATUS[view.status]}</p>

      {view.doctor ? (
        <Card className="mt-8">
          <p className="text-sm text-ink-muted">Medicul tău</p>
          <p className="mt-1 text-lg font-semibold text-navy-950">{view.doctor.name}</p>
          <p className="text-sm text-ink-soft">
            Specialitatea: {view.doctor.specialty} · cod de parafă {view.doctor.parafa}
          </p>
        </Card>
      ) : (
        view.status === "submitted" && (
          <Card className="mt-8 text-sm text-ink-soft">
            Evaluarea așteaptă un medic. Când o preia, îi vezi aici numele, specialitatea și codul de parafă.
            Suma este doar rezervată pe card.
          </Card>
        )
      )}

      {view.adjustedPlan && (
        <Card className="mt-8">
          <p className="text-sm text-ink-muted">Medicul îți propune un plan ajustat</p>
          <p className="mt-1 text-lg font-semibold text-navy-950">{view.adjustedPlan.title}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {view.adjustedPlan.sideEffects.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {view.adjustedPlan.warning && (
            <p
              role="note"
              className="mt-3 rounded-2xl border-l-4 border-amber-800/60 bg-amber-100/60 p-3 text-sm text-navy-950"
            >
              {view.adjustedPlan.warning}
            </p>
          )}
          <p className="mt-3 text-sm text-ink-soft">
            Prețul rămâne același. Suma se încasează doar dacă accepți; dacă nu, rezervarea se anulează
            integral.
          </p>
          <AdjustmentAnswer caseId={view.id} />
        </Card>
      )}

      {view.status === "declined" && (
        <Card className="mt-8">
          <p className="font-semibold text-navy-950">Medicul nu recomandă un tratament online acum.</p>
          {view.declineReason && <p className="mt-2 text-ink-soft">{view.declineReason}</p>}
          <p className="mt-2 text-ink-soft">
            Rezervarea de pe card a fost anulată integral: nu plătești nimic. Recomandarea medicului pentru un
            consult în persoană este în mesajele de mai jos.
          </p>
        </Card>
      )}

      {view.order && (
        <Card className="mt-8">
          <p className="text-sm text-ink-muted">Livrare</p>
          <p className="mt-1 font-semibold text-navy-950">{ORDER[view.order.status] ?? view.order.status}</p>
          {view.order.trackingCode && (
            <p className="mt-1 text-sm text-ink-soft">
              {view.order.carrier ?? "Curier"} · AWB {view.order.trackingCode}
            </p>
          )}
        </Card>
      )}

      <Messages caseId={view.id} messages={view.messages} me="patient" canSend={view.canMessage} />
    </Screen>
  );
}
