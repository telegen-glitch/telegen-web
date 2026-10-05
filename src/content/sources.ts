import type { Source } from "./types";

/**
 * Primary and authoritative sources cited on medical pages.
 * Every URL must be checked by the medical reviewer before launch (docs/open-items.md).
 */
export const sources: Source[] = [
  {
    id: "kanti-2018",
    citation:
      "Kanti V, Messenger A, Dobos G, et al. Evidence-based (S3) guideline for the treatment of androgenetic alopecia in women and in men – short version. J Eur Acad Dermatol Venereol. 2018;32(1):11–22.",
    url: "https://doi.org/10.1111/jdv.14624",
    kind: "guideline",
  },
  {
    id: "olsen-2002",
    citation:
      "Olsen EA, Dunlap FE, Funicella T, et al. A randomized clinical trial of 5% topical minoxidil versus 2% topical minoxidil and placebo in the treatment of androgenetic alopecia in men. J Am Acad Dermatol. 2002;47(3):377–385.",
    url: "https://doi.org/10.1067/mjd.2002.124088",
    kind: "trial",
  },
  {
    id: "kaufman-1998",
    citation:
      "Kaufman KD, Olsen EA, Whiting D, et al. Finasteride in the treatment of men with androgenetic alopecia. J Am Acad Dermatol. 1998;39(4 Pt 1):578–589.",
    url: "https://doi.org/10.1016/S0190-9622(98)70007-6",
    kind: "trial",
  },
  {
    id: "statpearls-aga",
    citation:
      "Ho CH, Sood T, Zito PM. Androgenetic Alopecia. În: StatPearls. Treasure Island (FL): StatPearls Publishing; actualizat periodic.",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK430924/",
    kind: "review",
  },
  {
    id: "hamilton-1951",
    citation:
      "Hamilton JB. Patterned loss of hair in man: types and incidence. Ann N Y Acad Sci. 1951;53(3):708–728.",
    url: "https://doi.org/10.1111/j.1749-6632.1951.tb31971.x",
    kind: "review",
  },
  {
    id: "norwood-1975",
    citation:
      "Norwood OT. Male pattern baldness: classification and incidence. South Med J. 1975;68(11):1359–1365.",
    url: "https://doi.org/10.1097/00007611-197511000-00009",
    kind: "review",
  },
  {
    id: "ludwig-1977",
    citation:
      "Ludwig E. Classification of the types of androgenetic alopecia (common baldness) occurring in the female sex. Br J Dermatol. 1977;97(3):247–254.",
    url: "https://doi.org/10.1111/j.1365-2133.1977.tb15179.x",
    kind: "review",
  },
  {
    id: "ema-finasteride-2025",
    citation:
      "Agenția Europeană a Medicamentului (EMA). Finasteride- and dutasteride-containing medicinal products: evaluarea PRAC privind ideația suicidară, 2025.",
    url: "https://www.ema.europa.eu/en/medicines/human/referrals/finasteride-dutasteride-containing-medicinal-products",
    kind: "label",
  },
];

export function getSource(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
