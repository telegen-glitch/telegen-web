"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PhoneMockup,
  ScreenFollowUp,
  ScreenPlan,
  ScreenQuestion,
  ScreenReview,
  type MockupContent,
} from "./PhoneMockup";

const steps: { title: string; text: string; Screen: (m: MockupContent) => ReactNode }[] = [
  {
    title: "Spui ce observi",
    text: "Răspunzi la întrebări clare despre ce s-a schimbat, de când și ce ai încercat. Durează câteva minute, de pe telefon.",
    Screen: (m) => <ScreenQuestion question={m.question} options={m.options} />,
  },
  {
    title: "Un medic analizează",
    text: "Medicul, cu specialitatea potrivită afecțiunii tale, citește evaluarea, îți poate pune întrebări și decide dacă tratamentul la distanță ți se potrivește.",
    Screen: () => <ScreenReview />,
  },
  {
    title: "Primești un plan clar",
    text: "Ce ai, ce opțiuni există, la ce să te aștepți și când reevaluăm. Fără termeni greu de înțeles.",
    Screen: (m) => <ScreenPlan goal={m.goal} checkIn={m.checkIn} />,
  },
  {
    title: "Rămânem alături",
    text: "Verificări periodice și întrebări oricând. Planul se ajustează în funcție de cum evoluezi.",
    Screen: (m) => <ScreenFollowUp followUp={m.followUp} />,
  },
];

/**
 * Four steps with phone mockups. Desktop: the phone stays pinned while the steps
 * scroll past and its screen cross-fades to the active step. Mobile: each step
 * carries its own phone, revealed on scroll.
 */
export function HowWeHelp({ mockup }: { mockup: MockupContent }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-20">
      <ol className="space-y-16 lg:space-y-0">
        {steps.map((s, i) => (
          <li
            key={s.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-step={i}
            className="lg:flex lg:min-h-[70vh] lg:items-center"
          >
            <div data-reveal className="lg:max-w-md">
              {/* Active step: accent rule + coloured number. Text keeps full contrast. */}
              <div
                className={`border-l-2 pl-5 transition-colors duration-500 lg:pl-7 ${active === i ? "border-blue-600" : "border-line-soft"}`}
              >
                <span
                  className={`text-eyebrow transition-colors duration-500 ${active === i ? "text-blue-700" : "text-ink-muted"}`}
                >
                  Pasul {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-display-3">{s.title}</h3>
                <p className="mt-3 text-lead">{s.text}</p>
              </div>
            </div>
            <div data-reveal="scale" className="mt-8 rounded-card-lg bg-mist py-10 lg:hidden">
              <PhoneMockup>{s.Screen(mockup)}</PhoneMockup>
            </div>
          </li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-28 flex h-[calc(100vh-9rem)] max-h-[44rem] items-center justify-center rounded-card-lg bg-mist">
          <div className="relative">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={`transition-[opacity,transform] duration-500 ease-calm ${i === 0 ? "relative" : "absolute inset-0"} ${
                  active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
                }`}
              >
                <PhoneMockup>{s.Screen(mockup)}</PhoneMockup>
              </div>
            ))}
          </div>
          <p className="absolute bottom-5 text-xs text-ink-muted">Interfață ilustrativă</p>
        </div>
      </div>
    </div>
  );
}
