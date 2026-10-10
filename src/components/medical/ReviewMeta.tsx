import Link from "next/link";
import type { MedicalDoc, TeamMember } from "@/content/types";
import { specialtyLabel } from "@/content/clinicians";

const dateFmt = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));

/**
 * Author, medical review and dates. Doctors are never named publicly (§v4.D):
 * a real review shows the reviewer's specialty and the date, linked to the
 * editorial policy. Without a recorded review the page says who wrote it and
 * when it was updated, and makes no review claim (v4.7).
 */
export function ReviewMeta({
  doc,
  reviewer,
  reviewedAt,
}: {
  doc: MedicalDoc;
  reviewer?: TeamMember;
  reviewedAt?: string;
}) {
  return (
    <div className="border-y border-line py-4 text-sm">
      {reviewer && reviewedAt ? (
        <p className="font-medium text-navy-950">
          <Link
            href="/politica-editoriala"
            className="underline decoration-navy-950/30 underline-offset-2 hover:decoration-navy-950"
          >
            Revizuit medical de un medic {specialtyLabel[reviewer.specialty]} din echipa Telegen
          </Link>{" "}
          · <time dateTime={reviewedAt}>{formatDate(reviewedAt)}</time>
        </p>
      ) : (
        <p className="font-medium text-navy-950">
          <Link
            href="/politica-editoriala"
            className="underline decoration-navy-950/30 underline-offset-2 hover:decoration-navy-950"
          >
            Scris de echipa editorială Telegen pe baza ghidurilor citate
          </Link>{" "}
          · actualizat <time dateTime={doc.updatedAt}>{formatDate(doc.updatedAt)}</time>
        </p>
      )}
      <p className="mt-1 text-ink-muted">
        {reviewer && reviewedAt && (
          <>
            Scris de echipa editorială Telegen · actualizat{" "}
            <time dateTime={doc.updatedAt}>{formatDate(doc.updatedAt)}</time> ·{" "}
          </>
        )}
        publicat <time dateTime={doc.publishedAt}>{formatDate(doc.publishedAt)}</time> ·{" "}
        <Link href="/politica-editoriala" className="underline underline-offset-2 hover:text-navy-950">
          cum scriem și verificăm
        </Link>
      </p>
    </div>
  );
}
