import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemporaryNote } from "@/components/ui/Temporary";
import { formatDate } from "@/components/medical/ReviewMeta";

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
        <div className="max-w-[42rem]">
          <TemporaryNote>
            Document de lucru. Textul final se stabilește împreună cu un jurist, după confirmarea datelor
            societății, înainte de lansare.
          </TemporaryNote>
        </div>
        <div className="prose-telegen mt-8">{children}</div>
      </div>
    </>
  );
}
