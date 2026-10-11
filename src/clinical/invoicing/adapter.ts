import "server-only";

/**
 * Invoices for the service (CLAUDE.md v5) through SmartBill or Oblio, both
 * Romanian e-Factura-ready invoicing services. Disabled until the owner supplies
 * credentials; captured payments then wait as "pending" invoices and are issued
 * by the scheduled job. The only item is "Plan Telegen": no condition, no medicine.
 * The request formats follow the providers' public API documentation and have
 * not been run against a live account yet (no credentials).
 */
export interface InvoiceInput {
  reference: string;
  amount: number;
  buyer: { name: string; email: string; address: string; city: string; county: string };
}

export interface InvoiceAdapter {
  readonly kind: "smartbill" | "oblio";
  issue(input: InvoiceInput): Promise<{ number: string }>;
}

const ITEM = "Plan Telegen";

function smartbill(env: { email: string; token: string; cif: string; series: string }): InvoiceAdapter {
  return {
    kind: "smartbill",
    async issue(input) {
      const res = await fetch("https://ws.smartbill.ro/SBORO/api/invoice", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${env.email}:${env.token}`).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          companyVatCode: env.cif,
          seriesName: env.series,
          client: {
            name: input.buyer.name,
            email: input.buyer.email,
            address: input.buyer.address,
            city: input.buyer.city,
            county: input.buyer.county,
            country: "Romania",
            isTaxPayer: false,
            saveToDb: false,
          },
          products: [
            {
              name: ITEM,
              measuringUnitName: "buc",
              currency: "RON",
              quantity: 1,
              price: input.amount,
              isTaxIncluded: true,
              isService: true,
            },
          ],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { number?: string; series?: string };
      if (!res.ok || !data.number) throw new Error(`smartbill ${res.status}`);
      return { number: `${data.series ?? env.series}${data.number}` };
    },
  };
}

function oblio(env: { email: string; secret: string; cif: string; series: string }): InvoiceAdapter {
  return {
    kind: "oblio",
    async issue(input) {
      const tokenRes = await fetch("https://www.oblio.eu/api/authorize/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `client_id=${encodeURIComponent(env.email)}&client_secret=${encodeURIComponent(env.secret)}`,
      });
      const token = ((await tokenRes.json().catch(() => ({}))) as { access_token?: string }).access_token;
      if (!token) throw new Error("oblio auth");
      const res = await fetch("https://www.oblio.eu/api/docs/invoice", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          cif: env.cif,
          seriesName: env.series,
          client: {
            name: input.buyer.name,
            email: input.buyer.email,
            address: input.buyer.address,
            city: input.buyer.city,
            state: input.buyer.county,
            country: "Romania",
            save: false,
          },
          products: [
            {
              name: ITEM,
              measuringUnit: "buc",
              currency: "RON",
              quantity: 1,
              price: input.amount,
              vatIncluded: 1,
              productType: "Serviciu",
            },
          ],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        data?: { seriesName?: string; number?: string };
      };
      if (!res.ok || !data.data?.number) throw new Error(`oblio ${res.status}`);
      return { number: `${data.data.seriesName ?? env.series}${data.data.number}` };
    },
  };
}

export function invoiceAdapter(env: NodeJS.ProcessEnv = process.env): InvoiceAdapter | null {
  const cif = env.INVOICE_CIF?.trim();
  const series = env.INVOICE_SERIES?.trim();
  if (!cif || !series) return null;
  if (env.SMARTBILL_EMAIL && env.SMARTBILL_TOKEN)
    return smartbill({ email: env.SMARTBILL_EMAIL, token: env.SMARTBILL_TOKEN, cif, series });
  if (env.OBLIO_EMAIL && env.OBLIO_SECRET)
    return oblio({ email: env.OBLIO_EMAIL, secret: env.OBLIO_SECRET, cif, series });
  return null;
}
