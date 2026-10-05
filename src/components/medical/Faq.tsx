import type { Faq as FaqItem } from "@/content/types";
import { renderRichText } from "@/lib/rich-text";

/** Native disclosure: works without JavaScript and with the keyboard. */
export function FaqList({ faqs, sourceOrder = [] }: { faqs: FaqItem[]; sourceOrder?: string[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-base font-semibold text-navy-950 md:text-lg [&::-webkit-details-marker]:hidden">
            {f.question}
            <span
              aria-hidden="true"
              className="relative h-4 w-4 shrink-0 before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-4 before:bg-navy-950 after:absolute after:top-0 after:left-1/2 after:h-4 after:w-[1.5px] after:bg-navy-950 after:transition-transform group-open:after:scale-y-0"
            />
          </summary>
          <div className="pr-8 pb-5 text-ink-soft">
            <p>{renderRichText(f.answer, sourceOrder)}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
