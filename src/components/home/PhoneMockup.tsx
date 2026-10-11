import type { ReactNode } from "react";

/** Screen content for one condition (from content data) or the neutral home version. */
export interface MockupContent {
  question: string;
  options: string[];
  goal: string;
  checkIn: string;
  followUp: string;
}

const neutral = {
  goal: "Un obiectiv clar, stabilit cu medicul",
  checkIn: "Stabilită de medic",
  followUp: "Perfect. Ne auzim la reevaluare. Până atunci, îmi poți scrie oricând.",
};

/** Neutral screens for pages that are not about one condition (home, how it works). */
export function neutralMockup(conditionNames: string[]): MockupContent {
  return { question: "Cu ce te putem ajuta?", options: conditionNames, ...neutral };
}

/**
 * Device frame for illustrative screens of Telegen's own interface. Built in
 * HTML/CSS (no images): crisp at any size, no LCP cost. Decorative: the
 * surrounding text carries the meaning, so the frame is hidden from AT.
 */
export function PhoneMockup({
  children,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto select-none ${size === "sm" ? "w-[12.5rem] sm:w-[17rem]" : "w-[15.5rem] sm:w-[17rem]"} ${className}`}
    >
      <div className="rounded-[2.6rem] bg-navy-950 p-[0.55rem] shadow-[var(--shadow-float)]">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2.1rem] bg-white">
          <div className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-pill bg-navy-950" />
          <div className="flex h-full flex-col px-4 pt-10 pb-4 text-[0.6875rem] leading-snug text-ink">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[0.8125rem] font-semibold text-navy-950">telegen</span>
      <span className="text-[0.625rem] text-ink-muted">{title}</span>
    </div>
  );
}

export function ScreenQuestion({ question, options }: Pick<MockupContent, "question" | "options">) {
  return (
    <>
      <MiniHeader title="4 din 10" />
      <div className="mt-2 h-1 rounded-full bg-line-soft">
        <div className="h-full w-2/5 rounded-full bg-navy-950" />
      </div>
      <p className="mt-5 text-[0.9375rem] leading-tight font-semibold text-navy-950">{question}</p>
      <div className="mt-4 space-y-1.5">
        {options.map((o, i) => (
          <div
            key={o}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${i === 1 ? "border-navy-950 bg-navy-950 text-white" : "border-line"}`}
          >
            {o}
            <span
              className={`h-3 w-3 rounded-[4px] border ${i === 1 ? "border-white bg-white" : "border-line"}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-pill bg-navy-950 py-2.5 text-center font-semibold text-white">
        Continuă
      </div>
    </>
  );
}

export function ScreenReview() {
  const steps = [
    { label: "Evaluare trimisă", done: true },
    { label: "Medicul analizează", active: true },
    { label: "Planul tău", done: false },
  ];
  return (
    <>
      <MiniHeader title="Status" />
      <p className="mt-5 text-[0.9375rem] leading-tight font-semibold text-navy-950">
        Evaluarea ta este la medic
      </p>
      <p className="mt-1.5 text-ink-muted">
        Primești un mesaj când planul e gata sau dacă medicul are întrebări.
      </p>
      <ol className="mt-5 space-y-3">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${s.done ? "border-navy-950 bg-navy-950 text-white" : s.active ? "border-blue-600" : "border-line"}`}
            >
              {s.done ? "✓" : s.active ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
            </span>
            <span className={s.active ? "font-semibold text-navy-950" : ""}>{s.label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto rounded-2xl bg-mist p-3">
        <p className="font-semibold text-navy-950">Medicul tău</p>
        <p className="text-ink-muted">cu drept de liberă practică în România</p>
      </div>
    </>
  );
}

export function ScreenPlan({
  goal = neutral.goal,
  checkIn = neutral.checkIn,
}: Partial<Pick<MockupContent, "goal" | "checkIn">>) {
  return (
    <>
      <MiniHeader title="Planul tău" />
      <p className="mt-5 text-[0.9375rem] leading-tight font-semibold text-navy-950">
        Planul stabilit de medic
      </p>
      <div className="mt-4 space-y-2">
        {[
          ["Ce urmărim", goal],
          ["Tratament", "Ales de medic, explicat pas cu pas"],
          ["Prima reevaluare", checkIn],
          ["Întrebări", "Oricând, prin mesaje"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-mist px-3 py-2.5">
            <p className="text-[0.625rem] font-semibold tracking-wide text-ink-muted uppercase">{k}</p>
            <p className="mt-0.5 font-medium text-navy-950">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-pill border border-navy-950/20 py-2.5 text-center font-semibold text-navy-950">
        Întreabă medicul
      </div>
    </>
  );
}

export function ScreenFollowUp({ followUp = neutral.followUp }: Partial<Pick<MockupContent, "followUp">>) {
  return (
    <>
      <MiniHeader title="Mesaje" />
      <div className="mt-5 space-y-2.5">
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-mist px-3 py-2">
          A trecut o lună. Cum merge? Ai observat efecte nedorite?
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-navy-950 px-3 py-2 text-white">
          Totul bine, nimic deosebit.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-mist px-3 py-2">{followUp}</div>
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-pill border border-line px-3 py-2 text-ink-muted">
        Scrie un mesaj…
      </div>
    </>
  );
}
