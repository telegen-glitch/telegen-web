import Link from "next/link";
import type { Clinician, MedicalDoc } from "@/content/types";
import { TemporaryBadge } from "@/components/ui/Temporary";

const dateFmt = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

/** Author, medical reviewer and dates. Shows reviewer only if real; otherwise says so. */
export function ReviewMeta({ doc, reviewer }: { doc: MedicalDoc; reviewer?: Clinician }) {
  const realReviewer = reviewer && !reviewer.temporary ? reviewer : undefined;
  return (
    <dl className="grid gap-x-8 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <dt className="text-ink-muted">Scris de</dt>
        <dd className="font-medium text-navy-950">Redacția medicală Telegen</dd>
      </div>
      <div>
        <dt className="text-ink-muted">Revizuire medicală</dt>
        <dd className="font-medium text-navy-950">
          {realReviewer ? (
            <Link href={`/echipa-medicala/${realReviewer.slug}`} className="underline underline-offset-2">
              {realReviewer.name}, {realReviewer.credential}
            </Link>
          ) : (
            <span className="flex flex-wrap items-center gap-2">
              În așteptare <TemporaryBadge />
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-ink-muted">Publicat</dt>
        <dd className="font-medium text-navy-950">
          <time dateTime={doc.publishedAt}>{formatDate(doc.publishedAt)}</time>
        </dd>
      </div>
      <div>
        <dt className="text-ink-muted">{realReviewer && doc.review ? "Revizuit" : "Actualizat"}</dt>
        <dd className="font-medium text-navy-950">
          <time dateTime={realReviewer && doc.review ? doc.review.reviewedAt : doc.updatedAt}>
            {formatDate(realReviewer && doc.review ? doc.review.reviewedAt : doc.updatedAt)}
          </time>
        </dd>
      </div>
    </dl>
  );
}
