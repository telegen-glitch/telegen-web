import type { TimelineStep } from "@/content/types";
import { renderRichText } from "@/lib/rich-text";

export function Timeline({ steps, sourceOrder = [] }: { steps: TimelineStep[]; sourceOrder?: string[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li
          key={s.period}
          className="relative grid grid-cols-[1.5rem_1fr] gap-x-4 pb-9 last:pb-0 md:grid-cols-[10rem_1.5rem_1fr] md:gap-x-6"
        >
          <p className="col-start-2 row-start-1 text-eyebrow text-blue-700 md:col-start-1 md:pt-0.5 md:text-right">
            {s.period}
          </p>
          <span
            aria-hidden="true"
            className="relative col-start-1 row-span-3 row-start-1 flex justify-center md:col-start-2"
          >
            <span className="mt-1.5 h-3 w-3 rounded-full border-2 border-navy-950 bg-white" />
            {i < steps.length - 1 && <span className="absolute top-5 -bottom-9 w-px bg-line" />}
          </span>
          <div className="col-start-2 mt-1 md:col-start-3 md:row-start-1 md:mt-0">
            <h3 className="text-lg font-semibold text-navy-950">{s.title}</h3>
            <p className="mt-1.5 max-w-xl text-ink-soft">{renderRichText(s.text, sourceOrder)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
