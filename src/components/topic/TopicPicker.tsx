"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Button";
import { setPendingTopic } from "./pendingTopic";

export interface Topic {
  slug: string;
  name: string;
  teaser?: string;
  href?: string;
}

interface TopicPickerValue {
  open: () => void;
}

const Ctx = createContext<TopicPickerValue | null>(null);

/**
 * "Cu ce te putem ajuta?" modal. Only published topics are links; upcoming ones
 * are shown as non-clickable "în curând". Native <dialog>: focus trap, Escape
 * and inert background come from the platform.
 */
export function TopicPickerProvider({
  topics,
  upcoming,
  children,
}: {
  topics: Topic[];
  upcoming: Topic[];
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    ref.current?.showModal();
    setIsOpen(true);
  }, []);
  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => setIsOpen(false);
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close(); // backdrop click
    };
    d.addEventListener("close", onClose);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="topic-picker-title"
        className="topic-dialog m-0 mt-auto w-full max-w-none rounded-t-[1.75rem] bg-white p-0 text-ink shadow-[var(--shadow-float)] sm:m-auto sm:max-w-lg sm:rounded-[1.75rem]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
          <div>
            <p className="text-eyebrow text-blue-700">Evaluare online</p>
            <h2 id="topic-picker-title" className="mt-2 text-display-3">
              Cu ce te putem ajuta?
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Închide"
            className="-mt-1 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-navy-950 hover:bg-mist"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="mt-5 space-y-2 px-4 pb-6 sm:px-6 sm:pb-8">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link
                href={t.href ?? "/evaluare"}
                onClick={() => {
                  setPendingTopic(t.slug);
                  close();
                }}
                className="group flex min-h-18 items-center justify-between gap-4 rounded-2xl bg-mist px-5 py-4 transition-colors hover:bg-mist-deep"
              >
                <span>
                  <span className="block text-lg font-semibold text-navy-950">{t.name}</span>
                  {t.teaser && <span className="mt-0.5 block text-sm text-ink-muted">{t.teaser}</span>}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-navy-950 text-white transition-transform group-hover:translate-x-0.5">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
          {upcoming.map((t) => (
            <li key={t.slug}>
              <div
                aria-disabled="true"
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-dashed border-line px-5 py-4 text-ink-muted"
              >
                <span className="text-lg font-medium">{t.name}</span>
                <span className="rounded-pill bg-mist px-3 py-1 text-xs font-semibold">în curând</span>
              </div>
            </li>
          ))}
        </ul>
      </dialog>
    </Ctx.Provider>
  );
}

export function useTopicPicker(): TopicPickerValue | null {
  return useContext(Ctx);
}
