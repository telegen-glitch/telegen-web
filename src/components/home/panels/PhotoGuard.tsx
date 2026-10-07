"use client";

import { useEffect, useRef } from "react";

/**
 * Load state for the hero photo (no visible output):
 * - not loaded yet: `data-photo-wait` keeps it hidden, then `data-photo-reveal` plays the
 *   reveal and the light sweep as it arrives, instead of a hard pop-in;
 * - already loaded at hydration: shown as is, and `data-photo-reveal` is only set once
 *   the panel has closed, so the next opening reveals it (no flash now);
 * - failed (missing file, blocked request): `data-failed` shows the line drawing.
 * Without JavaScript the photo simply shows, still.
 */
export function PhotoGuard() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const art = ref.current?.closest<HTMLElement>(".cp-photo");
    const panel = art?.closest<HTMLElement>(".cp-panel");
    const img = art?.querySelector<HTMLImageElement>(".cp-photo-parallax img");
    if (!art || !panel || !img) return;
    const imgs = [...art.querySelectorAll("img")];
    const fail = () => art.setAttribute("data-failed", "");
    const loaded = () => {
      art.removeAttribute("data-photo-wait");
      art.setAttribute("data-photo-reveal", "");
    };
    let observer: MutationObserver | undefined;
    if (imgs.some((i) => i.complete && i.currentSrc && i.naturalWidth === 0)) fail();
    else if (img.complete && img.naturalWidth > 0) {
      observer = new MutationObserver(() => {
        if (panel.hasAttribute("data-open")) return;
        art.setAttribute("data-photo-reveal", "");
        observer?.disconnect();
      });
      observer.observe(panel, { attributes: true, attributeFilter: ["data-open"] });
    } else {
      art.setAttribute("data-photo-wait", "");
      img.addEventListener("load", loaded, { once: true });
    }
    imgs.forEach((i) => i.addEventListener("error", fail));
    return () => {
      observer?.disconnect();
      img.removeEventListener("load", loaded);
      imgs.forEach((i) => i.removeEventListener("error", fail));
    };
  }, []);
  return <span ref={ref} hidden />;
}
