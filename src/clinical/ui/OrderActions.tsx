"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { updateOrderAction } from "../staff-actions";
import { ErrorText, inputClasses } from "./parts";

/** Pharmacy order steps: packing → shipped (carrier + tracking code) → delivered. */
export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const id = useId();
  const go = (next: string) =>
    start(async () => {
      setError(null);
      const res = await updateOrderAction(orderId, next, carrier, tracking);
      if (res.ok) router.refresh();
      else setError(next === "shipped" ? "Completează curierul și codul AWB." : "Actualizarea nu a reușit.");
    });
  if (status === "pending")
    return (
      <button
        type="button"
        disabled={pending}
        className={buttonClasses("primary", "md", "mt-4")}
        onClick={() => go("packing")}
      >
        Pregătesc coletul
      </button>
    );
  if (status === "packing")
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor={`${id}-c`} className="block text-sm font-medium text-navy-950">
            Curier
          </label>
          <input
            id={`${id}-c`}
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor={`${id}-t`} className="block text-sm font-medium text-navy-950">
            Cod AWB
          </label>
          <input
            id={`${id}-t`}
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className={inputClasses}
          />
        </div>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "md")}
          onClick={() => go("shipped")}
        >
          Coletul a plecat
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  if (status === "shipped")
    return (
      <button
        type="button"
        disabled={pending}
        className={buttonClasses("secondary", "md", "mt-4")}
        onClick={() => go("delivered")}
      >
        Marchează livrat
      </button>
    );
  return null;
}
