export const careSteps = [
  {
    title: "Răspunzi la câteva întrebări",
    text: "Evaluarea online durează câteva minute. Întrebările urmăresc ce te-ar întreba un dermatolog la cabinet, pe înțelesul tău.",
  },
  {
    title: "Un medic dermatolog analizează",
    text: "Un medic cu drept de liberă practică în România citește răspunsurile și fotografiile, apoi decide dacă tratamentul la distanță ți se potrivește.",
  },
  {
    title: "Primești planul și urmărirea",
    text: "Dacă e potrivit, primești un plan de tratament explicat clar și reevaluări periodice. Dacă nu, îți spunem ce consult îți trebuie.",
  },
];

/** Short three-step explainer, used near the top of home and condition pages. */
export function Steps({ tone = "white" }: { tone?: "white" | "paper" }) {
  const card = tone === "paper" ? "bg-white" : "bg-paper";
  return (
    <ol className="grid gap-3 lg:grid-cols-3 lg:gap-4">
      {careSteps.map((s, i) => (
        <li
          key={s.title}
          className={`rounded-card ${card} p-6 md:grid md:grid-cols-[4rem_1fr] md:p-7 lg:block`}
        >
          <span className="font-serif text-[2.5rem] leading-none text-blue-700" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <h3 className="mt-5 text-lg font-semibold text-navy-950 md:mt-0 lg:mt-5">
              <span className="sr-only">Pasul {i + 1}: </span>
              {s.title}
            </h3>
            <p className="mt-2 text-ink-soft">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
