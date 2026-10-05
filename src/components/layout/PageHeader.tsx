import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Crumb } from "@/lib/seo";

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="bg-paper">
      <div className="container-page pt-6 pb-12 md:pt-8 md:pb-16">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 max-w-3xl md:mt-12">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 text-display-1">{title}</h1>
          {lead && <div className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">{lead}</div>}
          {children}
        </div>
      </div>
    </header>
  );
}
