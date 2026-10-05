import { TemporaryNote } from "@/components/ui/Temporary";
import { siteConfig } from "@/lib/site";

/**
 * Pricing block, shown after the education on condition pages. OFF by default
 * (siteConfig.features.pricing). Prices are an owner decision: none are invented here.
 */
export function Pricing() {
  if (!siteConfig.features.pricing) return null;
  return (
    <section aria-labelledby="preturi" className="border-t border-line-soft">
      <div className="container-page py-16 md:py-24">
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
