import type { Metadata } from "next";
import Link from "next/link";
import { doctorQueue } from "@/clinical/doctor/workflow";
import { staffGate } from "@/clinical/staff";
import { SignOutButton } from "@/clinical/ui/AccountSignIn";
import { conditionName, DOCTOR_STATUS, slaText } from "@/clinical/ui/labels";
import { Card, Screen } from "@/clinical/ui/parts";
import { StaffGateView } from "@/clinical/ui/StaffGateView";

export const metadata: Metadata = { title: "Panoul medicului", robots: { index: false, follow: false } };

export default async function DoctorQueuePage() {
  const gate = await staffGate("doctor");
  if (gate.state !== "ok") return <StaffGateView gate={gate} title="Panoul medicului" />;
  const queue = await doctorQueue(gate.session);
  const mine = queue.filter((c) => c.mine);
  const open = queue.filter((c) => !c.mine);
  const list = (items: typeof queue, empty: string) =>
    items.length === 0 ? (
      <p className="mt-3 text-sm text-ink-soft">{empty}</p>
    ) : (
      <ul className="mt-3 space-y-3">
        {items.map((c) => (
          <li key={c.id}>
            <Link href={`/medic/${c.id}`} className="block">
              <Card className="flex items-center justify-between gap-4 hover:ring-2 hover:ring-navy-950/20">
                <span>
                  <span className="block font-semibold text-navy-950">
                    {conditionName(c.condition)}
                    {c.test && (
                      <span className="ml-2 rounded-md bg-mist px-1.5 py-0.5 text-xs text-ink-soft">
                        TEST
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-ink-soft">
                    {DOCTOR_STATUS[c.status]} · caz {c.id.slice(0, 8)}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-navy-950 tabular-nums">
                  {slaText(c.slaDueAt, c.paused)}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    );
  return (
    <Screen wide>
      <p className="text-eyebrow text-blue-700">Panoul medicului</p>
      <h1 className="mt-3 text-display-2">
        Evaluări <span className="accent">de analizat.</span>
      </h1>
      <section aria-labelledby="ale-mele" className="mt-10">
        <h2 id="ale-mele" className="text-xl font-semibold text-navy-950">
          Cazurile tale
        </h2>
        {list(mine, "Nu ai cazuri preluate.")}
      </section>
      <section aria-labelledby="coada" className="mt-10">
        <h2 id="coada" className="text-xl font-semibold text-navy-950">
          Coada specialității tale
        </h2>
        {list(open, "Coada e goală.")}
      </section>
      <div className="mt-10">
        <SignOutButton />
      </div>
    </Screen>
  );
}
