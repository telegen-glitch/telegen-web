"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { PharmacyRow } from "../admin/ops";
import { createPharmacyAction } from "../staff-actions";
import { Card, ErrorText, inputClasses } from "./parts";

/** Partner pharmacies: name, Stripe Connect account (for its share of each payment) and a staff sign-in. */
export function AdminPharmacies({ pharmacies }: { pharmacies: PharmacyRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", stripeAccount: "", memberEmail: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <ul className="mt-3 space-y-3">
        {pharmacies.map((p) => (
          <li key={p.id}>
            <Card className="text-sm">
              <span className="font-semibold text-navy-950">{p.name}</span>
              {!p.active && " · inactivă"}
              <span className="block text-ink-soft">
                Stripe Connect: {p.stripeAccount ?? "nesetat"} · conturi: {p.members.join(", ") || "niciunul"}
              </span>
            </Card>
          </li>
        ))}
      </ul>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setError(null);
            const res = await createPharmacyAction(form);
            if (res.ok) {
              setForm({ name: "", stripeAccount: "", memberEmail: "" });
              router.refresh();
            } else setError("Verifică datele: nume, cont Stripe (acct_…) și o adresă de e-mail nouă.");
          });
        }}
      >
        <Card className="space-y-4">
          <p className="font-semibold text-navy-950">Adaugă o farmacie parteneră</p>
          {(
            [
              ["name", "Denumirea farmaciei"],
              ["stripeAccount", "Cont Stripe Connect (acct_…), opțional acum"],
              ["memberEmail", "E-mailul contului farmaciei"],
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <label htmlFor={`farmacie-${k}`} className="block text-sm font-medium text-navy-950">
                {label}
              </label>
              <input
                id={`farmacie-${k}`}
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                className={inputClasses}
              />
            </div>
          ))}
          <button type="submit" disabled={pending} className={buttonClasses("primary", "md")}>
            Creează farmacia
          </button>
          {error && <ErrorText>{error}</ErrorText>}
        </Card>
      </form>
    </>
  );
}
