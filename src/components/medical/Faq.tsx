import type { Faq as FaqItem } from "@/content/types";
import { renderRichText } from "@/lib/rich-text";

/** Native disclosure (works without JS); height animates via ::details-content where supported. */
export function FaqList({ faqs, sourceOrder = [] }: { faqs: FaqItem[]; sourceOrder?: string[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.question} className="faq group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold text-navy-950 md:text-lg [&::-webkit-details-marker]:hidden">
            {f.question}
            <span
              aria-hidden="true"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist transition-colors duration-300 group-open:bg-navy-950"
            >
              <span className="absolute h-[1.5px] w-3.5 bg-navy-950 transition-colors duration-300 group-open:bg-white" />
              <span className="absolute h-3.5 w-[1.5px] bg-navy-950 transition-transform duration-300 ease-calm group-open:scale-y-0" />
            </span>
          </summary>
          <div className="pr-12 pb-6 text-ink-soft">
            <p>{renderRichText(f.answer, sourceOrder)}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
