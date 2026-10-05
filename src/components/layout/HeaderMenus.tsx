"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import type { NavLink } from "@/lib/nav";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Desktop "Afecțiuni" disclosure. */
export function ConditionsMenu({ conditions }: { conditions: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-sm font-medium text-ink-soft transition-colors hover:text-navy-950 aria-expanded:text-navy-950"
      >
        Afecțiuni <Chevron open={open} />
      </button>
      <div
        id={id}
        hidden={!open}
        className="absolute top-full left-0 mt-2 w-[26rem] rounded-card border border-line-soft bg-white p-3 shadow-[0_12px_40px_-12px_rgba(10,22,49,0.18)]"
      >
        <ul>
          {conditions.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                onClick={() => setOpen(false)}
                className="group block rounded-xl px-4 py-3 transition-colors hover:bg-paper"
              >
                <span className="flex items-center justify-between font-serif text-xl text-navy-950">
                  {c.label}
                  <Arrow className="text-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                {c.description && (
                  <span className="mt-1 block text-sm leading-snug text-ink-muted">{c.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-line-soft px-4 pt-3 pb-1 text-sm">
          <Link
            href="/afectiuni"
            onClick={() => setOpen(false)}
            className="font-medium text-blue-700 hover:underline"
          >
            Toate afecțiunile
          </Link>
          <span className="text-ink-muted"> · alte afecțiuni dermatologice, în pregătire</span>
        </div>
      </div>
    </div>
  );
}

/** Mobile full-height menu: conditions first, then the rest, CTA pinned at the bottom. */
export function MobileMenu({ conditions, links }: { conditions: NavLink[]; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(64);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  const openMenu = () => {
    // Sit directly under the header, whether or not the pre-launch bar is visible.
    const header = buttonRef.current?.closest("header");
    if (header) setTop(Math.max(0, header.getBoundingClientRect().bottom));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      const all = [buttonRef.current!, ...focusables];
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        onClick={() => (open ? close() : openMenu())}
        className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-pill text-navy-950"
      >
        <span aria-hidden="true" className="relative block h-5 w-5">
          <span
            className={`absolute top-1/2 left-0 h-[1.5px] w-5 bg-current transition-transform duration-200 ${open ? "rotate-45" : "-translate-y-[4px]"}`}
          />
          <span
            className={`absolute top-1/2 left-0 h-[1.5px] w-5 bg-current transition-transform duration-200 ${open ? "-rotate-45" : "translate-y-[4px]"}`}
          />
        </span>
      </button>

      <div
        id={id}
        ref={panelRef}
        hidden={!open}
        style={{ top }}
        className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto border-t border-line-soft bg-white"
      >
        <nav aria-label="Meniu mobil" className="container-page flex-1 pt-6 pb-8">
          <p className="text-eyebrow text-ink-muted">Afecțiuni</p>
          <ul className="mt-2">
            {conditions.map((c) => (
              <li key={c.href} className="border-b border-line-soft">
                <Link
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-16 items-center justify-between py-3 font-serif text-[1.625rem] leading-tight text-navy-950"
                >
                  {c.label}
                  <Arrow className="text-blue-700" />
                </Link>
              </li>
            ))}
            <li className="py-3 text-sm text-ink-muted">Alte afecțiuni dermatologice, în pregătire.</li>
          </ul>

          <ul className="mt-6 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-lg font-medium text-navy-950"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/echipa-medicala"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-lg font-medium text-navy-950"
              >
                Echipa medicală
              </Link>
            </li>
          </ul>
        </nav>
        <div className="sticky bottom-0 border-t border-line-soft bg-white">
          <div className="container-page py-4">
            <Link
              href="/evaluare"
              onClick={() => setOpen(false)}
              className={buttonClasses("primary", "lg", "w-full")}
            >
              Începe evaluarea <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
