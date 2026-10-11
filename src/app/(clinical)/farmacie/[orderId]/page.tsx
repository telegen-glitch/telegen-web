import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pharmacyOrders } from "@/clinical/pharmacy/orders";
import { staffGate } from "@/clinical/staff";
import { StaffGateView } from "@/clinical/ui/StaffGateView";

export const metadata: Metadata = { title: "Fișă de însoțire", robots: { index: false, follow: false } };

/**
 * Packing slip that travels inside the parcel: the recipient, the order number
 * and the prescription. No condition anywhere; the outside of the parcel carries
 * only the courier's label.
 */
export default async function PackingSlipPage({ params }: PageProps<"/farmacie/[orderId]">) {
  const gate = await staffGate("pharmacy");
  if (gate.state !== "ok") return <StaffGateView gate={gate} title="Farmacie" />;
  const { orderId } = await params;
  const order = (await pharmacyOrders(gate.session)).find((o) => o.id === orderId);
  if (!order) notFound();
  return (
    <div className="mx-auto max-w-2xl bg-white px-6 py-10 text-navy-950">
      <h1 className="text-2xl font-semibold">Fișă de însoțire · comanda {order.id.slice(0, 8)}</h1>
      {order.test && <p className="mt-2 font-semibold">COMANDĂ TEST: nu se expediază.</p>}
      <section className="mt-6">
        <h2 className="font-semibold">Destinatar</h2>
        <p className="mt-1">
          {order.ship.name}
          <br />
          {order.ship.address}, {order.ship.city}, {order.ship.county}, {order.ship.postalCode}
          <br />
          {order.ship.phone}
        </p>
      </section>
      <section className="mt-6">
        <h2 className="font-semibold">Conținut, conform rețetei</h2>
        <ul className="mt-1 list-disc pl-5">
          {order.items.map((i) => (
            <li key={i.name}>
              {i.name}: {i.instructions}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">
          Rețetă emisă de {order.doctor.name}, cod de parafă {order.doctor.parafa}.
        </p>
      </section>
      <p className="mt-8 text-sm">
        Întrebări despre tratament: scrie medicului din contul tău Telegen. Prospectul se află în cutia
        fiecărui medicament.
      </p>
    </div>
  );
}
