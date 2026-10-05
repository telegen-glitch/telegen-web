const items = [
  { title: "Evaluare online", text: "Câteva minute, de pe telefon." },
  { title: "Analiză medicală", text: "Un dermatolog citește tot." },
  { title: "Plan și urmărire", text: "Știi ce urmează, lună de lună." },
];

/** Compact numbered strip directly under the hero. */
export function StepStrip() {
  return (
    <section aria-label="Pe scurt, cum funcționează" className="border-y border-line-soft">
      <ol
        data-reveal-group
        className="container-page grid divide-y divide-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {items.map((s, i) => (
          <li
            key={s.title}
            data-reveal
            className="flex items-baseline gap-4 py-5 sm:px-6 sm:py-7 sm:first:pl-0"
          >
            <span className="font-serif text-2xl text-blue-700 italic">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block font-semibold text-navy-950">{s.title}</span>
              <span className="block text-sm text-ink-muted">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
