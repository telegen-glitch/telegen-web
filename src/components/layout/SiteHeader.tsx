"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { StartButton } from "@/components/topic/StartButton";
import type { NavGroup, NavLink } from "@/lib/nav";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform duration-300 ease-calm ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MegaLink({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  if (link.upcoming) {
    return (
      <span
        aria-disabled="true"
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-ink-muted"
      >
        <span className="font-medium">{link.label}</span>
        <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-semibold">în curând</span>
      </span>
    );
  }
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="group block rounded-2xl px-4 py-3 transition-colors hover:bg-mist"
    >
      <span className="flex items-center justify-between gap-3 font-semibold text-navy-950">
        {link.label}
        <Arrow className="-translate-x-1 text-blue-700 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
      {link.description && (
        <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{link.description}</span>
      )}
    </Link>
  );
}

/**
 * Sticky header: logo, desktop mega-menus, primary CTA, full-screen mobile menu.
 * Gains a hairline shadow once the page scrolls.
 */
export function SiteHeader({ groups }: { groups: NavGroup[] }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTop, setMobileTop] = useState(64);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const mobileId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Desktop mega-menu: Escape and outside click close it.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openGroup]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Mobile menu: scroll lock, Escape, focus trap.
  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [
        menuButtonRef.current!,
        ...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ];
      const first = items[0];
      const last = items[items.length - 1];
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
  }, [mobileOpen, closeMobile]);

  const openMobile = () => {
    if (headerRef.current) setMobileTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
    setMobileOpen(true);
  };

  const hoverOpen = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenGroup(id), 80);
  };
  const hoverClose = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenGroup(null), 160);
  };

  const active = groups.find((g) => g.id === openGroup);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled || undefined}
      onMouseLeave={hoverClose}
      className="sticky top-0 z-40 bg-white transition-shadow duration-300 data-scrolled:shadow-[var(--shadow-header)]"
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.75rem]">
        <Link
          href="/"
          className="-m-2 flex min-h-11 items-center p-2"
          aria-label="Telegen, pagina principală"
        >
          <Logo />
        </Link>

        <nav aria-label="Navigare principală" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {groups.map((g) => (
              <li key={g.id} onMouseEnter={() => hoverOpen(g.id)}>
                <button
                  type="button"
                  aria-expanded={openGroup === g.id}
                  aria-controls={`mega-${g.id}`}
                  onClick={() => setOpenGroup((o) => (o === g.id ? null : g.id))}
                  className="flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-navy-950 aria-expanded:bg-mist aria-expanded:text-navy-950"
                >
                  {g.label} <Chevron open={openGroup === g.id} />
                </button>
              </li>
            ))}
            <li onMouseEnter={hoverClose}>
              <Link
                href="/ghiduri"
                className="flex min-h-11 items-center rounded-pill px-4 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-navy-950"
              >
                Ghiduri
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <StartButton size="md" arrow={false} className="hidden sm:inline-flex" />
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
            onClick={() => (mobileOpen ? closeMobile() : openMobile())}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-pill text-navy-950 lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-5 w-5">
              <span
                className={`absolute top-1/2 left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ease-calm ${mobileOpen ? "rotate-45" : "-translate-y-[4px]"}`}
              />
              <span
                className={`absolute top-1/2 left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ease-calm ${mobileOpen ? "-rotate-45" : "translate-y-[4px]"}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Desktop mega-menu panels */}
      {groups.map((g) => (
        <div
          key={g.id}
          id={`mega-${g.id}`}
          hidden={openGroup !== g.id}
          onMouseEnter={() => hoverOpen(g.id)}
          className="mega-panel absolute inset-x-0 top-full hidden border-t border-line-soft bg-white shadow-[var(--shadow-float)] lg:block"
        >
          <div className="container-page grid grid-cols-[1fr_1fr_22rem] gap-10 py-8">
            {g.columns.map((col) => (
              <div key={col.heading}>
                <p className="px-4 text-eyebrow text-ink-muted">{col.heading}</p>
                <ul className="mt-2 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <MegaLink link={l} onNavigate={() => setOpenGroup(null)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {g.columns.length < 2 && <div aria-hidden="true" />}
            <div className="rounded-card bg-navy-950 p-7 text-white">
              <p className="text-2xl leading-tight font-semibold tracking-tight">
                Nu știi de unde să începi?{" "}
                <span className="accent text-blue-200">Începe cu întrebările.</span>
              </p>
              <p className="mt-3 text-sm text-white/70">
                Câteva minute, fără cont. Răspunsurile nu sunt salvate.
              </p>
              <StartButton variant="inverse" size="md" className="mt-6" />
            </div>
          </div>
        </div>
      ))}
      {active && (
        <span className="sr-only" aria-live="polite">
          {active.label} deschis
        </span>
      )}

      {/* Mobile full-screen menu */}
      <div
        id={mobileId}
        ref={panelRef}
        hidden={!mobileOpen}
        style={{ top: mobileTop }}
        className="mobile-menu fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-white lg:hidden"
      >
        <nav aria-label="Meniu mobil" className="container-page flex-1 pt-4 pb-8">
          {groups.map((g) => (
            <div key={g.id} className="border-b border-line-soft py-4">
              <p className="text-eyebrow text-ink-muted">{g.label}</p>
              <ul className="mt-2">
                {g.columns
                  .flatMap((c) => c.links)
                  .map((l) =>
                    l.upcoming ? (
                      <li
                        key={l.href}
                        className="flex min-h-12 items-center justify-between text-xl font-medium text-ink-muted"
                      >
                        {l.label}
                        <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-semibold">
                          în curând
                        </span>
                      </li>
                    ) : (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-12 items-center justify-between text-xl font-semibold tracking-tight text-navy-950"
                        >
                          {l.label}
                          <Arrow className="text-blue-700" />
                        </Link>
                      </li>
                    ),
                  )}
              </ul>
            </div>
          ))}
          <Link
            href="/ghiduri"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex min-h-12 items-center justify-between text-xl font-semibold tracking-tight text-navy-950"
          >
            Ghiduri <Arrow className="text-blue-700" />
          </Link>
        </nav>
        <div className="sticky bottom-0 border-t border-line-soft bg-white">
          <div className="container-page py-4" onClick={() => setMobileOpen(false)}>
            <StartButton className="w-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
