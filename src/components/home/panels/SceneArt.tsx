"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene } from "./scenes/gl";

export type SceneKind = "hair" | "skin";

/** Only one WebGL context at a time: starting a scene disposes the previous one. */
let activeDispose: (() => void) | null = null;
/** Set when this device proved too slow (or has no GPU): posters only from then on. */
let gaveUp = false;

const idle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 2500 });
  else setTimeout(cb, 1200);
};

/**
 * Realistic panel art. The static poster (the scene's calm final frame) is always
 * rendered first and stays for closed panels, reduced motion, Save-Data and when
 * WebGL2 is unavailable. Otherwise, once the page has loaded and the panel is
 * open and on screen, the scene module is imported on demand and fades in over
 * the poster in the same box (no layout shift). It pauses offscreen and in hidden
 * tabs, restarts its story each time the panel opens and is disposed on close.
 */
export function SceneArt({ kind }: { kind: SceneKind }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    const panel = el?.closest<HTMLElement>(".cp-panel");
    if (!el || !cv || !panel) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData || gaveUp || typeof WebGL2RenderingContext === "undefined") return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const quality =
      (navigator.hardwareConcurrency ?? 8) < 4
        ? "low"
        : coarse || window.innerWidth < 640
          ? "mobile"
          : "high";
    const dprCap = quality === "high" ? 2 : 1.5;

    let scene: Scene | null = null;
    let loading = false;
    let ready = false;
    let visible = false;
    let open = panel.hasAttribute("data-open");
    let settleTimer = 0;
    let settled = open;
    let raf = 0;
    let last = 0;
    let t = 0;
    let gone = false;
    // Tests opt in to software WebGL (CI has no GPU); the site never does.
    const allowSoftware = Boolean((window as Window & { __telegenSoftwareGL?: boolean }).__telegenSoftwareGL);
    // Slow-frame guard: sustained frames slower than ~22 fps, or render calls that
    // block the main thread, mean this device cannot run the scene smoothly. Fall
    // back to the poster. The counter decays, so a brief hiccup does not count.
    let frames = 0;
    let slow = 0;
    let skip = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const destroy = () => {
      stop();
      scene?.dispose();
      scene = null;
      t = 0;
      frames = 0;
      slow = 0;
      setLive(false);
      if (activeDispose === destroy) activeDispose = null;
    };
    const loop = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      t += Math.min(0.05, dt);
      last = now;
      // After the story, the ambient state renders at 30 fps.
      skip = t > 14 ? !skip : false;
      if (!skip && scene) {
        const start = performance.now();
        scene.render(t);
        const cost = performance.now() - start;
        if (frames++ > 3) slow = dt > 0.045 || cost > 12 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 8 && !allowSoftware) {
          gaveUp = true;
          destroy();
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const update = async () => {
      if (gone || gaveUp) return;
      if (!open) {
        if (scene) destroy();
        return;
      }
      const run = ready && settled && visible && !document.hidden;
      if (run && !scene && !loading) {
        loading = true;
        try {
          const mod = kind === "hair" ? await import("./scenes/hair") : await import("./scenes/skin");
          if (gone || !open) return;
          if (activeDispose && activeDispose !== destroy) activeDispose();
          scene = mod.create(cv, { quality, dprCap, allowSoftware });
          if (!scene) gaveUp = true; // no GPU: keep the poster for this visit
          if (scene) {
            activeDispose = destroy;
            setLive(true);
          }
        } catch {
          scene = null; // keep the poster
        } finally {
          loading = false;
        }
      }
      if (scene && ready && settled && visible && !document.hidden) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        stop();
      }
    };

    // Start only after the page has loaded and the main thread is idle.
    const onLoad = () => idle(() => ((ready = true), void update()));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        void update();
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    // Panel open/close (door panels on the home page). Wait for the door to finish opening.
    const mo = new MutationObserver(() => {
      const now = panel.hasAttribute("data-open");
      if (now === open) return;
      open = now;
      window.clearTimeout(settleTimer);
      settled = false;
      if (open) settleTimer = window.setTimeout(() => ((settled = true), void update()), 560);
      void update();
    });
    mo.observe(panel, { attributes: true, attributeFilter: ["data-open"] });

    const onVisibility = () => void update();
    document.addEventListener("visibilitychange", onVisibility);

    // Desktop only: strands lean away from the pointer, or the light follows it.
    const onMove = (e: PointerEvent) => {
      if (!scene || e.pointerType !== "mouse") return;
      const r = cv.getBoundingClientRect();
      scene.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, true);
    };
    const onLeave = () => scene?.setPointer(0.5, 0.5, false);
    if (!coarse) {
      panel.addEventListener("pointermove", onMove);
      panel.addEventListener("pointerleave", onLeave);
    }
    const ro = new ResizeObserver(() => scene?.resize());
    ro.observe(el);

    const lost = (e: Event) => {
      e.preventDefault();
      destroy();
    };
    cv.addEventListener("webglcontextlost", lost);

    return () => {
      gone = true;
      window.removeEventListener("load", onLoad);
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      window.clearTimeout(settleTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("webglcontextlost", lost);
      destroy();
    };
  }, [kind]);

  return (
    <div ref={box} aria-hidden="true" className="cp-art cp-art-scene">
      <picture>
        <source type="image/avif" srcSet={`/posters/${kind}.avif`} />
        <img
          src={`/posters/${kind}.webp`}
          alt=""
          width={1400}
          height={560}
          loading="lazy"
          decoding="async"
          className="cp-poster"
          data-kind={kind}
        />
      </picture>
      <canvas ref={canvas} className="cp-canvas" data-live={live ? "" : undefined} />
    </div>
  );
}
