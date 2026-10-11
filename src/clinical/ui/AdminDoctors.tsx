"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { DoctorRow } from "../admin/ops";
import { createDoctorAction, setDoctorActiveAction } from "../staff-actions";
import { Card, ErrorText, inputClasses } from "./parts";

const SPEC: Record<string, string> = {
  dermatologie: "Dermatologie",
  urologie: "Urologie",
  "medicina-de-familie": "Medicină de familie",
};

/** Doctor accounts. Identities live only in the database, never in the code or the docs. */
export function AdminDoctors({ doctors }: { doctors: DoctorRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", fullName: "", specialty: "dermatologie", parafa: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <ul className="mt-3 space-y-3">
        {doctors.map((d) => (
          <li key={d.id}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block font-semibold text-navy-950">{d.fullName}</span>
                <span className="block text-sm text-ink-soft">
                  {SPEC[d.specialty]} · parafă {d.parafa} · {d.email} · 2FA {d.twoFactor ? "da" : "nu"}
                  {!d.active && " · inactiv"}
                </span>
              </span>
              <button
                type="button"
                disabled={pending}
                className={buttonClasses("secondary", "md")}
                onClick={() =>
                  start(async () => {
                    await setDoctorActiveAction(d.id, !d.active);
                    router.refresh();
                  })
                }
              >
                {d.active ? "Dezactivează" : "Activează"}
              </button>
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
            const res = await createDoctorAction(form);
            if (res.ok) {
              setForm({ email: "", fullName: "", specialty: "dermatologie", parafa: "" });
              router.refresh();
            } else
              setError(
                res.error === "locked"
                  ? "Există deja un cont cu această adresă."
                  : "Verifică datele: e-mail, nume, specialitate, cod de parafă.",
              );
          });
        }}
      >
        <Card className="space-y-4">
          <p className="font-semibold text-navy-950">Adaugă un medic</p>
          {(
            [
              ["email", "E-mail", "email"],
              ["fullName", "Nume complet (îl vede pacientul)", "text"],
              ["parafa", "Cod de parafă (îl vede pacientul și farmacia)", "text"],
            ] as const
          ).map(([k, label, type]) => (
            <div key={k}>
              <label htmlFor={`medic-${k}`} className="block text-sm font-medium text-navy-950">
                {label}
              </label>
              <input
                id={`medic-${k}`}
                type={type}
                required
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                className={inputClasses}
              />
            </div>
          ))}
          <div>
            <label htmlFor="medic-specialty" className="block text-sm font-medium text-navy-950">
              Specialitate
            </label>
            <select
              id="medic-specialty"
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              className={inputClasses}
            >
              {Object.entries(SPEC).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={pending} className={buttonClasses("primary", "md")}>
            Creează contul
          </button>
          <p className="text-sm text-ink-soft">
            Medicul intră cu un cod primit pe e-mail și configurează obligatoriu autentificarea în doi pași.
          </p>
          {error && <ErrorText>{error}</ErrorText>}
        </Card>
      </form>
    </>
  );
}
