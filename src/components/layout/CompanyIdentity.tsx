import { Missing } from "@/components/ui/Missing";
import { launchConfig, showOwnerMarkers } from "@/lib/launch-config";

const rows: [label: string, key: keyof typeof launchConfig.company, missing: string][] = [
  ["Denumire", "legalName", "denumirea societății"],
  ["CUI", "cui", "CUI"],
  ["Nr. Registrul Comerțului", "regCom", "nr. Registrul Comerțului"],
  ["Sediu", "address", "adresa sediului"],
];

/**
 * Company identity from launch-config. A missing value shows an owner-only marker
 * on previews; in production its row is simply left out (and the launch lock
 * stops an "open" production build before that can happen).
 */
export function CompanyIdentity({ tone = "light" }: { tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-white/60" : "text-ink-muted";
  const strong = tone === "dark" ? "text-white/85" : "text-navy-950";
  const visible = rows.filter(([, key]) => launchConfig.company[key] || showOwnerMarkers());
  if (visible.length === 0) return null;
  return (
    <dl className="grid gap-x-6 gap-y-1 text-xs leading-5 sm:grid-cols-[auto_1fr]">
      {visible.map(([label, key, missing]) => (
        <div key={key} className="contents">
          <dt className={muted}>{label}</dt>
          <dd className={strong}>{launchConfig.company[key] ?? <Missing what={missing} tone={tone} />}</dd>
        </div>
      ))}
    </dl>
  );
}
