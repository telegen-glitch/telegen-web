import { TemporaryNote } from "@/components/ui/Temporary";
import { isEnabled } from "@/lib/flags";

/**
 * Pricing block, shown after the education on condition pages. OFF by default
 * (flags.pricing). Prices are an owner decision: none are invented here.
 */
export function Pricing() {
  if (!isEnabled("pricing")) return null;
  return (
    <section aria-labelledby="preturi" className="border-t border-line-soft section-y">
      <div className="container-page">
        <h2 id="preturi" className="text-display-2">
          Prețuri
        </h2>
        <div className="mt-6 max-w-xl">
          <TemporaryNote>
            Prețurile se stabilesc de proprietar și se publică înainte de lansare.
          </TemporaryNote>
        </div>
      </div>
    </section>
  );
}
