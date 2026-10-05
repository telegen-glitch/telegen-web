import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { Crumb } from "@/lib/seo";

/** Inner-page hero: breadcrumbs, two-part headline with italic accent, lead. */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  accent,
  lead,
  children,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="bg-mist">
      <div className="container-page pt-5 pb-12 md:pt-7 lg:pb-20">
        <Breadcrumbs items={crumbs} />
        <div
          className={`mt-8 md:mt-12 ${aside ? "grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16" : ""}`}
        >
          <div className="max-w-3xl">
            {eyebrow && <p className="text-eyebrow text-blue-700">{eyebrow}</p>}
            <h1 className="mt-3 text-display-1">
              {title} {accent && <span className="accent">{accent}</span>}
            </h1>
            {lead && <div className="mt-5 max-w-2xl text-lead">{lead}</div>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </header>
  );
}
