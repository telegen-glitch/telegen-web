import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/components/medical/ReviewMeta";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { isPrelaunch } from "@/lib/site";

export function LegalPage({
  title,
  path,
  updatedAt,
  children,
}: {
  title: string;
  path: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader crumbs={[{ name: title, href: path }]} eyebrow="Informații legale" title={title}>
        <p className="mt-4 text-sm text-ink-muted">
          Ultima actualizare: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
      </PageHeader>
      <div className="container-page py-12 md:py-16">
        {isPrelaunch() && (
          <p className="mb-8 max-w-[42rem] rounded-xl bg-mist p-4 text-sm text-ink-soft">
            {prelaunchCopy.legalNote}
          </p>
        )}
        <div className="prose-telegen">{children}</div>
      </div>
    </>
  );
}
