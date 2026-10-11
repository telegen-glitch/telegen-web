import "server-only";
import { splitFor } from "../config/pharmacy";
import type { Billing, PlanId } from "../config/plans";
import { asService, asUser } from "../db";
import { enqueue } from "../email/outbox";
import { IntakeError } from "../intake/cases";
import { invoiceAdapter } from "../invoicing/adapter";
import { logEvent } from "../log";
import { paymentProvider } from "../payments/provider";
import type { Session } from "../auth";

/**
 * After approval (CLAUDE.md v5 P4): the order goes to the partner pharmacy, the
 * pharmacy's share is paid out through Stripe Connect, and an invoice for the
 * service is queued. The pharmacy works through a narrow view: prescription,
 * doctor, delivery name and address, never the condition, answers or photos.
 */
const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

export async function fulfil(caseId: string): Promise<void> {
  const row = await asService(async (q) => {
    const [order] = await q.query<{ id: string; pharmacy_id: string | null }>(
      "select id, pharmacy_id from clinical.orders where case_id = $1 order by created_at desc limit 1",
      [caseId],
    );
    if (!order) return null;
    if (!order.pharmacy_id)
      await q.query(
        `update clinical.orders set pharmacy_id = (select id from clinical.pharmacies where active order by created_at limit 1)
         where id = $1`,
        [order.id],
      );
    const [ctx] = await q.query<{
      order_id: string;
      account: string | null;
      payment_id: string | null;
      intent_id: string | null;
      provider: string | null;
      amount: number | null;
      plan_id: PlanId | null;
      billing: Billing | null;
    }>(
      `select o.id as order_id, ph.stripe_account_id as account, p.id as payment_id, p.intent_id, p.provider, p.amount,
              pr.plan_id, pr.billing
       from clinical.orders o
       left join clinical.pharmacies ph on ph.id = o.pharmacy_id
       left join lateral (select * from clinical.payments where case_id = o.case_id and status = 'captured'
                          order by captured_at desc limit 1) p on true
       left join clinical.cases c on c.id = o.case_id
       left join clinical.proposals pr on pr.id = c.approved_proposal_id
       where o.id = $1`,
      [order.id],
    );
    if (ctx?.payment_id && ctx.amount)
      await q.query(
        "insert into clinical.invoices (case_id, payment_id, amount) values ($1, $2, $3) on conflict (payment_id) do nothing",
        [caseId, ctx.payment_id, ctx.amount],
      );
    return ctx ?? null;
  });
  if (!row?.intent_id || !row.plan_id || !row.billing || !row.account) return;
  const split = splitFor(row.plan_id, row.billing);
  const provider = paymentProvider();
  if (!split || !provider || provider.kind !== row.provider) return;
  try {
    const transferId = await provider.transfer({
      intentId: row.intent_id,
      amount: split,
      destination: row.account,
      caseId,
    });
    await asService((q) =>
      q.query("update clinical.orders set transfer_id = $2, transfer_amount = $3 where id = $1", [
        row.order_id,
        transferId,
        split,
      ]),
    );
  } catch {
    logEvent("payment.error", { case: caseId });
  }
}

/** Issues pending invoices once SmartBill or Oblio is configured (called by the scheduled job). */
export async function issuePendingInvoices(limit = 20): Promise<number> {
  const adapter = invoiceAdapter();
  if (!adapter) return 0;
  const pending = await asService((q) =>
    q.query<{
      id: string;
      amount: number;
      email: string;
      full_name: string | null;
      address_line: string | null;
      city: string | null;
      county: string | null;
    }>(
      `select i.id, i.amount, pr.email, pt.full_name, pt.address_line, pt.city, pt.county
       from clinical.invoices i join clinical.cases c on c.id = i.case_id
       join clinical.patients pt on pt.id = c.patient_id join clinical.profiles pr on pr.id = pt.id
       where i.status = 'pending' and not c.test order by i.created_at limit $1`,
      [limit],
    ),
  );
  let issued = 0;
  for (const inv of pending) {
    try {
      const { number } = await adapter.issue({
        reference: inv.id,
        amount: inv.amount,
        buyer: {
          name: inv.full_name ?? inv.email,
          email: inv.email,
          address: inv.address_line ?? "",
          city: inv.city ?? "",
          county: inv.county ?? "",
        },
      });
      await asService((q) =>
        q.query(
          "update clinical.invoices set status = 'issued', number = $2, provider = $3, issued_at = now() where id = $1",
          [inv.id, number, adapter.kind],
        ),
      );
      issued += 1;
    } catch {
      await asService((q) =>
        q.query("update clinical.invoices set status = 'failed', provider = $2 where id = $1", [
          inv.id,
          adapter.kind,
        ]),
      );
    }
  }
  return issued;
}

export interface PharmacyOrder {
  id: string;
  status: "pending" | "packing" | "shipped" | "delivered" | "canceled";
  createdAt: string;
  test: boolean;
  items: { name: string; instructions: string }[];
  doctor: { name: string; parafa: string };
  ship: {
    name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
    postalCode: string | null;
  };
  carrier: string | null;
  trackingCode: string | null;
}

export async function pharmacyOrders(session: Session): Promise<PharmacyOrder[]> {
  const rows = await asUser(actor(session), (q) =>
    q.query<{
      id: string;
      status: PharmacyOrder["status"];
      created_at: Date;
      test: boolean;
      prescription_items: { name: string; instructions: string }[];
      doctor_name: string;
      doctor_parafa: string;
      ship_name: string | null;
      ship_phone: string | null;
      ship_address: string | null;
      ship_city: string | null;
      ship_county: string | null;
      ship_postal_code: string | null;
      carrier: string | null;
      tracking_code: string | null;
    }>("select * from clinical.pharmacy_orders order by created_at desc limit 200"),
  );
  if (rows.length)
    await asUser(actor(session), (q) => q.query("select clinical.audit('read', 'pharmacy_orders', 'list')"));
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    test: r.test,
    items: r.prescription_items,
    doctor: { name: r.doctor_name, parafa: r.doctor_parafa },
    ship: {
      name: r.ship_name,
      phone: r.ship_phone,
      address: r.ship_address,
      city: r.ship_city,
      county: r.ship_county,
      postalCode: r.ship_postal_code,
    },
    carrier: r.carrier,
    trackingCode: r.tracking_code,
  }));
}

/** Packing → shipped (carrier + tracking code; the patient is told) → delivered. */
export async function updateOrder(
  session: Session,
  input: { orderId: string; status: unknown; carrier: unknown; tracking: unknown },
): Promise<void> {
  const status = input.status;
  if (status !== "packing" && status !== "shipped" && status !== "delivered")
    throw new IntakeError("invalid");
  const carrier = typeof input.carrier === "string" ? input.carrier.trim().slice(0, 60) : "";
  const tracking = typeof input.tracking === "string" ? input.tracking.trim().slice(0, 60) : "";
  if (status === "shipped" && (!carrier || !/^[A-Za-z0-9-]{4,40}$/.test(tracking)))
    throw new IntakeError("invalid");
  try {
    await asUser(actor(session), (q) =>
      q.query("select clinical.pharmacy_update_order($1, $2, $3, $4)", [
        input.orderId,
        status,
        carrier || null,
        tracking || null,
      ]),
    );
  } catch {
    throw new IntakeError("not_found");
  }
  if (status === "shipped")
    await asService(async (q) => {
      const [o] = await q.query<{ patient_id: string; case_id: string }>(
        "select c.patient_id, c.id as case_id from clinical.orders o join clinical.cases c on c.id = o.case_id where o.id = $1",
        [input.orderId],
      );
      if (o) await enqueue(q, o.patient_id, "order_shipped", o.case_id);
    });
}
