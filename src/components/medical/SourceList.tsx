import type { Source } from "@/content/types";

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="surse" className="mt-14">
      <h2 id="surse" className="text-display-3">
        Surse
      </h2>
      <ol className="mt-4 space-y-3 text-sm text-ink-soft">
        {sources.map((s, i) => (
          <li key={s.id} id={`sursa-${s.id}`} className="grid scroll-mt-28 grid-cols-[2rem_1fr]">
            <span className="font-semibold text-ink-muted">[{i + 1}]</span>
            <span>
              {s.citation}{" "}
              <a
                href={s.url}
                className="break-words text-blue-700 underline underline-offset-2"
                rel="noopener noreferrer"
              >
                {s.url.replace(/^https?:\/\//, "")}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
