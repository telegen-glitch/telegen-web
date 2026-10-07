"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Hero condition panels: an accordion of vertical doors (desktop) or stacked
 * cards (mobile). All content is server-rendered and passed in as nodes; this
 * component only switches the open panel, pauses the illustrations offscreen
 * and runs the pointer light (and the hair photo's parallax). Exactly one panel is open at a time (APG
 * accordion: the open header is aria-disabled because it cannot collapse).
 */

export interface PanelView {
  slug: string;
  name: string;
  art: ReactNode;
  body: ReactNode;
}

interface PanelsValue {
  open: string;
  setOpen: (slug: string) => void;
  reveal: (slug: string) => void;
  rootRef: RefObject<HTMLDivElement | null>;
}

const Ctx = createContext<PanelsValue | null>(null);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PanelsProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reveal = useCallback((slug: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-panel="${slug}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, []);
  const value = useMemo(() => ({ open, setOpen, reveal, rootRef }), [open, reveal]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Hero chip: a link to the condition hub; with JS it opens that condition's panel instead. */
export function PanelChip({ slug, href, children }: { slug: string; href: string; children: ReactNode }) {
  const ctx = useContext(Ctx);
  return (
    <Link
      href={href}
      aria-controls={ctx ? `panou-${slug}` : undefined}
      onClick={(e) => {
        if (!ctx) return;
        e.preventDefault();
        ctx.setOpen(slug);
        ctx.reveal(slug);
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-navy-950/15 bg-white px-4 text-sm font-medium text-navy-950 transition-colors hover:border-navy-950"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue-600" />
      {children}
    </Link>
  );
}

/**
 * Plays illustrations only while visible (IntersectionObserver) and drives the
 * soft pointer light on fine-pointer devices. Both are skipped with reduced motion.
 */
export function usePanelEffects(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => root.toggleAttribute("data-playing", e.isIntersecting));
    io.observe(root);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return () => io.disconnect();
    let frame = 0;
    const move = (e: PointerEvent) => {
      const panel = (e.target as Element | null)?.closest<HTMLElement>(".cp-panel[data-open]");
      if (!panel) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${e.clientX - r.left}px`);
        panel.style.setProperty("--my", `${e.clientY - r.top}px`);
        // -1..1 from the centre, for the photo parallax.
        panel.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * 2 + "");
        panel.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * 2 + "");
        panel.setAttribute("data-lit", "");
      });
    };
    const leave = () => root.querySelectorAll("[data-lit]").forEach((el) => el.removeAttribute("data-lit"));
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, [rootRef]);
}

export function ConditionPanels({ panels }: { panels: PanelView[] }) {
  const ctx = useContext(Ctx);
  const [localOpen, setLocalOpen] = useState(panels[0]?.slug ?? "");
  const localRef = useRef<HTMLDivElement | null>(null);
  const open = ctx?.open ?? localOpen;
  const setOpen = ctx?.setOpen ?? setLocalOpen;
  const rootRef = ctx?.rootRef ?? localRef;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<number | undefined>(undefined);

  usePanelEffects(rootRef);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = panels.length - 1;
    const target =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? i === last
          ? 0
          : i + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? i === 0
            ? last
            : i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (target < 0) return;
    e.preventDefault();
    setOpen(panels[target].slug);
    buttons.current[target]?.focus();
  };

  // Hover opens a door on desktop (doors layout, fine pointer), with a short intent delay.
  const onPointerEnter = (slug: string) => {
    if (!window.matchMedia("(min-width: 80rem) and (hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(slug), 140);
  };

  return (
    <div ref={rootRef} className="cp-panels">
      {panels.map((p, i) => {
        const isOpen = p.slug === open;
        return (
          <div
            key={p.slug}
            data-panel={p.slug}
            data-open={isOpen ? "" : undefined}
            className="cp-panel"
            onPointerEnter={() => onPointerEnter(p.slug)}
            onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
          >
            {p.art}
            <h2 className="cp-heading">
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                id={`panou-buton-${p.slug}`}
                aria-expanded={isOpen}
                aria-controls={`panou-${p.slug}`}
                aria-disabled={isOpen || undefined}
                onClick={() => setOpen(p.slug)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="cp-button"
              >
                <span className="cp-name">{p.name}</span>
                <span aria-hidden="true" className="cp-plus">
                  +
                </span>
              </button>
            </h2>
            <div
              id={`panou-${p.slug}`}
              role="region"
              aria-labelledby={`panou-buton-${p.slug}`}
              hidden={!isOpen}
              className="cp-region"
            >
              {p.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** A single, always-open panel (condition hubs): same look, no switching. */
export function SinglePanel({
  art,
  label,
  children,
}: {
  art: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  usePanelEffects(ref);
  return (
    <div ref={ref} className="cp-panels cp-single">
      <section aria-label={label} data-open="" className="cp-panel">
        {art}
        <p className="cp-heading cp-name text-eyebrow text-blue-200">{label}</p>
        <div className="cp-region">{children}</div>
      </section>
    </div>
  );
}
