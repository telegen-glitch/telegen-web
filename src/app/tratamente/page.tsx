import Link from "next/link";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { plainText } from "@/lib/rich-text";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Informații despre tratamentele pentru căderea părului",
  description:
    "Informații neutre, cu surse, despre substanțele folosite în alopecia androgenetică: mecanism, dovezi, efecte adverse și limite.",
  path: "/tratamente",
});

/** Neutral educational index. No calls to action next to medicine names (section 9.4). */
export default function TreatmentsIndex() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Despre tratamente", href: "/tratamente" }]}
        eyebrow="Informații despre tratamente"
        title="Ce trebuie să știi despre tratamente"
        lead="Prezentăm substanțele active strict informativ: cum acționează, ce arată studiile, ce efecte adverse pot avea și unde sunt limitele. Ce ți se potrivește stabilește medicul."
      />
      <div className="container-page py-14 md:py-20">
        <ul className="divide-y divide-line border-y border-line">
          {content.listTreatments().map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tratamente/${t.slug}`}
                className="group grid gap-2 py-7 md:grid-cols-[16rem_1fr_auto] md:items-center md:gap-10"
              >
                <span className="font-serif text-[1.75rem] text-navy-950 group-hover:underline">
                  {t.title}
                </span>
                <span className="text-ink-soft">{plainText(t.summary)}</span>
                <Arrow className="hidden text-blue-700 md:block" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-ink-muted">
          Aceste pagini nu sunt recomandări de tratament și nu promovează medicamente. Unele substanțe se
          eliberează doar pe bază de prescripție medicală.
        </p>
      </div>
    </>
  );
}
