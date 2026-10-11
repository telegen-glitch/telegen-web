"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { ThreadMessage } from "../doctor/workflow";
import { patientMessageAction } from "../intake/actions";
import { doctorMessageAction } from "../staff-actions";
import { ErrorText } from "./parts";

const time = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** The case thread between the patient and their doctor. Free, at any time. */
export function Messages({
  caseId,
  messages,
  me,
  canSend,
}: {
  caseId: string;
  messages: ThreadMessage[];
  me: "patient" | "doctor";
  canSend: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const id = useId();
  return (
    <section aria-labelledby={`${id}-h`} className="mt-10">
      <h2 id={`${id}-h`} className="text-xl font-semibold text-navy-950">
        Mesaje
      </h2>
      {messages.length === 0 && <p className="mt-3 text-sm text-ink-soft">Niciun mesaj încă.</p>}
      <ol className="mt-4 space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`max-w-[85%] rounded-2xl p-4 text-sm ${m.from === me ? "ml-auto bg-navy-950 text-white" : "bg-white text-navy-950 shadow-[var(--shadow-card)]"}`}
          >
            <p className={`text-xs ${m.from === me ? "text-white/70" : "text-ink-muted"}`}>
              {m.from === "doctor" ? "Medicul" : me === "doctor" ? "Pacientul" : "Tu"} ·{" "}
              {time.format(new Date(m.at))}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
      </ol>
      {canSend && (
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            start(async () => {
              setError(null);
              const res =
                me === "doctor"
                  ? await doctorMessageAction(caseId, text)
                  : await patientMessageAction(caseId, text);
              if (res.ok) {
                setText("");
                router.refresh();
              } else setError("Mesajul nu a fost trimis. Încearcă din nou.");
            });
          }}
        >
          <label htmlFor={`${id}-t`} className="block text-sm font-medium text-navy-950">
            {me === "doctor" ? "Mesaj pentru pacient" : "Mesaj pentru medic"}
          </label>
          <textarea
            id={`${id}-t`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4000}
            rows={3}
            className="mt-1.5 block w-full rounded-2xl border border-line bg-white p-3 text-base text-navy-950 focus:border-navy-950"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className={buttonClasses("primary", "md", "mt-3")}
          >
            {pending ? "Se trimite…" : "Trimite mesajul"}
          </button>
          {error && <ErrorText>{error}</ErrorText>}
        </form>
      )}
    </section>
  );
}
