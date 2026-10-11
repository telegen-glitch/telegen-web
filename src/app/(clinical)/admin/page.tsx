import type { Metadata } from "next";
import { listDoctors, overview } from "@/clinical/admin/ops";
import { launchProblems } from "@/clinical/launch";
import { staffGate } from "@/clinical/staff";
import { SignOutButton } from "@/clinical/ui/AccountSignIn";
import { AdminDoctors } from "@/clinical/ui/AdminDoctors";
import { conditionName, DOCTOR_STATUS, slaText, when } from "@/clinical/ui/labels";
import { Card, Screen } from "@/clinical/ui/parts";
import { StaffGateView } from "@/clinical/ui/StaffGateView";

export const metadata: Metadata = { title: "Administrare", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const gate = await staffGate("admin");
  if (gate.state !== "ok") return <StaffGateView gate={gate} title="Administrare" />;
  const [ops, doctors, problems] = await Promise.all([
    overview(gate.session),
    listDoctors(gate.session),
    launchProblems(),
  ]);
  const month = new Date().toISOString().slice(0, 7);
  return (
    <Screen wide>
      <p className="text-eyebrow text-blue-700">Administrare</p>
      <h1 className="mt-3 text-display-2">
        Operațiuni <span className="accent">Telegen.</span>
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Aici vezi stadiul cazurilor, termenele și plățile. Răspunsurile, fotografiile și mesajele pacienților
        nu sunt vizibile pentru administratori.
      </p>

      <section aria-labelledby="lansare" className="mt-10">
        <h2 id="lansare" className="text-xl font-semibold text-navy-950">
          Pacienți reali
        </h2>
        <Card className="mt-3 text-sm">
          {problems.length === 0 ? (
            <p className="text-navy-950">Toate verificările de lansare sunt îndeplinite.</p>
          ) : (
            <>
              <p className="text-navy-950">
                Pacienții reali sunt acceptați doar în producție, după ce sunt gata:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </section>

      <section aria-labelledby="cazuri" className="mt-10">
        <h2 id="cazuri" className="text-xl font-semibold text-navy-950">
          Cazuri pe stadii
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {ops.counts.map((c) => (
            <li
              key={`${c.status}-${c.test}`}
              className="rounded-pill bg-white px-3 py-1.5 shadow-[var(--shadow-card)]"
            >
              {DOCTOR_STATUS[c.status] ?? c.status}
              {c.test ? " (TEST)" : ""}: <span className="font-semibold">{c.n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="atentie" className="mt-10">
        <h2 id="atentie" className="text-xl font-semibold text-navy-950">
          În lucru
        </h2>
        {ops.attention.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Niciun caz deschis.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ops.attention.map((a) => (
              <li key={a.id}>
                <Card className="text-sm">
                  <span className="font-semibold text-navy-950">{conditionName(a.condition)}</span> · caz{" "}
                  {a.id.slice(0, 8)} · {DOCTOR_STATUS[a.status]} ·{" "}
                  {slaText(a.slaDueAt, a.status === "waiting_patient")} · medic: {a.doctor ?? "nepreluat"} ·
                  rezervarea expiră: {when(a.holdUntil)}
                  {a.test && " · TEST"}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="medici" className="mt-10">
        <h2 id="medici" className="text-xl font-semibold text-navy-950">
          Medici
        </h2>
        <AdminDoctors doctors={doctors} />
      </section>

      <section aria-labelledby="plata-medici" className="mt-10">
        <h2 id="plata-medici" className="text-xl font-semibold text-navy-950">
          Plata medicilor
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          Un tarif fix pe evaluare încheiată, același pentru aprobare, ajustare sau refuz.
        </p>
        <a
          href={`/api/admin/ledger?luna=${month}`}
          className="mt-3 inline-block font-semibold text-blue-700 underline underline-offset-2"
        >
          Descarcă evaluările din {month} (CSV)
        </a>
      </section>
      <div className="mt-10">
        <SignOutButton />
      </div>
    </Screen>
  );
}
