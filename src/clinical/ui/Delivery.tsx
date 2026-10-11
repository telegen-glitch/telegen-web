"use client";

import { useState, useTransition } from "react";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import type { Delivery as DeliveryData } from "../intake/proposal";
import { saveDeliveryAction } from "../intake/actions";
import { Card, ERROR_TEXT, ErrorText, inputClasses } from "./parts";

const FIELDS: {
  key: keyof DeliveryData;
  label: string;
  autoComplete: string;
  inputMode?: "tel" | "numeric";
}[] = [
  { key: "fullName", label: "Nume și prenume", autoComplete: "name" },
  { key: "phone", label: "Telefon (pentru curier)", autoComplete: "tel", inputMode: "tel" },
  { key: "addressLine", label: "Adresa (stradă, număr, bloc, apartament)", autoComplete: "street-address" },
  { key: "city", label: "Localitatea", autoComplete: "address-level2" },
  { key: "county", label: "Județul", autoComplete: "address-level1" },
  { key: "postalCode", label: "Codul poștal", autoComplete: "postal-code", inputMode: "numeric" },
];

const EMPTY: DeliveryData = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  county: "",
  postalCode: "",
};

/** Delivery details for the pharmacy. The parcel never names the condition or the medicine. */
export function Delivery({
  initial,
  onSaved,
}: {
  initial: DeliveryData | null;
  onSaved: (d: DeliveryData) => void;
}) {
  const [data, setData] = useState<DeliveryData>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError(null);
          const res = await saveDeliveryAction(data);
          if (res.ok) onSaved(res.delivery);
          else
            setError(
              res.error === "invalid"
                ? "Verifică datele: telefon românesc (07… sau +40…), cod poștal de 6 cifre și adresa completă."
                : ERROR_TEXT[res.error],
            );
        });
      }}
    >
      <Card className="mt-8 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`livrare-${f.key}`} className="block text-sm font-medium text-navy-950">
              {f.label}
            </label>
            <input
              id={`livrare-${f.key}`}
              required
              autoComplete={f.autoComplete}
              inputMode={f.inputMode}
              value={data[f.key]}
              onChange={(e) => setData((d) => ({ ...d, [f.key]: e.target.value }))}
              className={inputClasses}
            />
          </div>
        ))}
      </Card>
      <p className="mt-4 text-sm text-ink-soft">
        Livrarea este gratuită. Coletul este discret: pe el nu apar numele afecțiunii sau al tratamentului.
      </p>
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
      >
        {pending ? "Se salvează…" : "Salvează și continuă"} <Arrow />
      </button>
      <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
    </form>
  );
}
