import type { Metadata } from "next";
import Link from "next/link";
import { pharmacyOrders } from "@/clinical/pharmacy/orders";
import { staffGate } from "@/clinical/staff";
import { SignOutButton } from "@/clinical/ui/AccountSignIn";
import { when } from "@/clinical/ui/labels";
import { OrderActions } from "@/clinical/ui/OrderActions";
import { Card, Screen } from "@/clinical/ui/parts";
import { StaffGateView } from "@/clinical/ui/StaffGateView";

export const metadata: Metadata = { title: "Farmacie", robots: { index: false, follow: false } };

const STATUS: Record<string, string> = {
  pending: "Nouă",
  packing: "În pregătire",
  shipped: "Expediată",
  delivered: "Livrată",
  canceled: "Anulată",
};

export default async function PharmacyPage() {
  const gate = await staffGate("pharmacy");
  if (gate.state !== "ok") return <StaffGateView gate={gate} title="Farmacie" />;
  const orders = await pharmacyOrders(gate.session);
  return (
    <Screen wide>
      <p className="text-eyebrow text-blue-700">Farmacie parteneră</p>
      <h1 className="mt-3 text-display-2">
        Comenzi <span className="accent">de pregătit.</span>
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Vezi doar rețeta, medicul și adresa de livrare. Coletul este discret: pe ambalaj nu apar afecțiunea
        sau tratamentul.
      </p>
      {orders.length === 0 && <p className="mt-8 text-ink-soft">Nicio comandă.</p>}
      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o.id}>
            <Card>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-navy-950">
                  Comanda {o.id.slice(0, 8)} · {STATUS[o.status]}
                  {o.test && (
                    <span className="ml-2 rounded-md bg-mist px-1.5 py-0.5 text-xs text-ink-soft">TEST</span>
                  )}
                </p>
                <p className="text-sm text-ink-muted">{when(o.createdAt)}</p>
              </div>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-navy-950">Rețeta</p>
                  <ul className="mt-1 space-y-1 text-ink-soft">
                    {o.items.map((i) => (
                      <li key={i.name}>
                        <span className="text-navy-950">{i.name}</span>: {i.instructions}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-ink-soft">
                    Medic: {o.doctor.name}, cod de parafă {o.doctor.parafa}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-navy-950">Livrare</p>
                  <p className="mt-1 text-ink-soft">
                    {o.ship.name}
                    <br />
                    {o.ship.address}, {o.ship.city}, {o.ship.county}, {o.ship.postalCode}
                    <br />
                    {o.ship.phone}
                  </p>
                  {o.trackingCode && (
                    <p className="mt-1 text-ink-soft">
                      {o.carrier} · AWB {o.trackingCode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/farmacie/${o.id}`}
                  className="mt-4 text-sm font-semibold text-blue-700 underline underline-offset-2"
                >
                  Fișa de însoțire (de tipărit)
                </Link>
              </div>
              <OrderActions orderId={o.id} status={o.status} />
            </Card>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <SignOutButton />
      </div>
    </Screen>
  );
}
