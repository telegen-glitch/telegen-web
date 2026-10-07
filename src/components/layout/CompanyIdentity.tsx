import { TemporaryBadge } from "@/components/ui/Temporary";
import { siteConfig } from "@/lib/site";

const rows: [label: string, key: keyof typeof siteConfig.company][] = [
  ["Denumire", "legalName"],
  ["CUI", "cui"],
  ["Nr. Registrul Comerțului", "regCom"],
  ["Sediu", "address"],
];

/** Company identity from siteConfig; missing values are visibly TEMPORARY (§9.6). */
export function CompanyIdentity({ tone = "light" }: { tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-white/60" : "text-ink-muted";
  const strong = tone === "dark" ? "text-white/85" : "text-navy-950";
  return (
    <dl className="grid gap-x-6 gap-y-1 text-xs leading-5 sm:grid-cols-[auto_1fr]">
      {rows.map(([label, key]) => (
        <div key={key} className="contents">
          <dt className={muted}>{label}</dt>
          <dd className={strong}>
            {siteConfig.company[key] ?? (
              <span className="inline-flex items-center gap-2">
                <TemporaryBadge /> <span className={muted}>se completează înainte de lansare</span>
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
