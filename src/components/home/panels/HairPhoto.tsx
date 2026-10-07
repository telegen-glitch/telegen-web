import type { ReactNode } from "react";
import { PhotoGuard } from "./PhotoGuard";

/**
 * Căderea părului: a real, licensed photo (docs/media-credits.md) of a man
 * styling his hair in a mirror. Decorative (alt=""): the panel text carries the
 * meaning. The man is a model, never a patient or a result, and the caption says so.
 *
 * Layers, outside in: parallax (pointer, desktop), breathing (slow drift and zoom
 * toward the face), the image (reveal on open), a one-off light sweep, the scrim
 * under the panel title and the pointer light. Motion lives in globals.css
 * (.cp-photo*): transforms and opacity only, paused offscreen or closed, none
 * with reduced motion. If the image fails, the line drawing underneath shows.
 */
const DIR = "/media/hero";

/**
 * Two crops of the same photo: the portrait for the tall, narrow closed door on
 * desktop (face only), the wide one for every open band (the whole face, the
 * mirror and his shoulder in the foreground). Both lazy: a crop that is not
 * displayed is never fetched (the portrait only on desktop, once another door opens).
 */
export function HairPhoto({ fallback }: { fallback: ReactNode }) {
  return (
    <div aria-hidden="true" className="cp-art cp-photo">
      <div className="cp-photo-fallback">{fallback}</div>
      <picture className="cp-photo-door">
        <source type="image/avif" srcSet={`${DIR}/hair-portrait.avif`} width={1100} height={1375} />
        <source type="image/webp" srcSet={`${DIR}/hair-portrait.webp`} width={1100} height={1375} />
        <img
          src={`${DIR}/hair-portrait.jpg`}
          width={1100}
          height={1375}
          alt=""
          loading="lazy"
          decoding="async"
          className="cp-photo-img"
        />
      </picture>
      <div className="cp-photo-parallax">
        <div className="cp-photo-breathe">
          <picture>
            <source type="image/avif" srcSet={`${DIR}/hair-wide.avif`} width={1600} height={1000} />
            <source type="image/webp" srcSet={`${DIR}/hair-wide.webp`} width={1600} height={1000} />
            <img
              src={`${DIR}/hair-wide.jpg`}
              width={1600}
              height={1000}
              alt=""
              loading="lazy"
              decoding="async"
              className="cp-photo-img"
            />
          </picture>
        </div>
      </div>
      <span className="cp-photo-sweep" />
      <span className="cp-photo-scrim" />
      <span className="cp-photo-light" />
      <p className="cp-photo-caption">Imagine de prezentare. Persoana este model.</p>
      <PhotoGuard />
    </div>
  );
}
