import type { Source } from "./types";

/**
 * Primary and authoritative sources cited on medical pages.
 * Acne, ED and the newer hair-loss entries were fetched and read on 2026-10-07 in a separate
 * session with web access (docs/sources/). The medical reviewer still checks each one before the
 * owner records a review (docs/REVIEW.md).
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
      "Ho CH, Sood T, Zito PM. Androgenetic Alopecia. În: StatPearls. Treasure Island (FL): StatPearls Publishing; actualizat 7 ianuarie 2024.",
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
      "Agenția Europeană a Medicamentului (EMA). Finasteride- and dutasteride-containing medicinal products: procedură de sesizare (referral) începută la 3 octombrie 2024; decizia Comisiei Europene din 22 august 2025.",
    url: "https://www.ema.europa.eu/en/medicines/human/referrals/finasteride-dutasteride-containing-medicinal-products",
    kind: "label",
  },
  // Hair loss: other causes and shedding (source pack, docs/sources/hair-loss-citations.md).
  {
    id: "statpearls-te",
    citation:
      "Hughes EC, Syed HA, Saleh D. Telogen Effluvium. În: StatPearls. Treasure Island (FL): StatPearls Publishing; actualizat 1 mai 2024.",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK430848/",
    kind: "review",
  },
  {
    id: "aad-hair-shedding",
    citation:
      "American Academy of Dermatology. Do you have hair loss or hair shedding? Informații pentru pacienți.",
    url: "https://www.aad.org/public/diseases/hair-loss/insider/shedding",
    kind: "organisation",
  },
  {
    id: "aad-hair-loss-causes",
    citation: "American Academy of Dermatology. Hair loss: who gets and causes. Informații pentru pacienți.",
    url: "https://www.aad.org/public/diseases/hair-loss/causes/18-causes",
    kind: "organisation",
  },
  // Acne (source pack, docs/sources/acne.md).
  {
    id: "euroguiderm-acne-2025",
    citation:
      "Nast A, et al. EuroGuiDerm Evidence-based Guideline for the Treatment of Acne – actualizare 2025 (versiunea extinsă). European Dermatology Forum; 2025, valabil până în iunie 2030.",
    url: "https://www.guidelines.edf.one/uploads/attachments/cmkmicwv8yrsarwjrzxnr41db-euroguiderm-acne-guideline-long-version.pdf",
    kind: "guideline",
  },
  {
    id: "aad-acne-2024",
    citation:
      "Reynolds RV, Yeung H, Cheng CE, et al. Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol. 2024.",
    url: "https://doi.org/10.1016/j.jaad.2023.12.017",
    kind: "guideline",
  },
  {
    id: "ema-retinoids-2018",
    citation:
      "Agenția Europeană a Medicamentului (EMA). Retinoid-containing medicinal products: procedură de sesizare conform art. 31; decizia Comisiei Europene din 21 iunie 2018.",
    url: "https://www.ema.europa.eu/en/medicines/human/referrals/retinoid-containing-medicinal-products",
    kind: "label",
  },
  {
    id: "nhs-acne-treatment",
    citation: "NHS. Acne: treatment. Pagină revizuită la 3 ianuarie 2023.",
    url: "https://www.nhs.uk/conditions/acne/treatment/",
    kind: "organisation",
  },
  {
    id: "dermnet-acne",
    citation: "Oakley A. Acne vulgaris. DermNet NZ; 2014, actualizat 2021.",
    url: "https://dermnetnz.org/topics/acne-vulgaris",
    kind: "review",
  },
  {
    id: "dermnet-acne-scars",
    citation: "DermNet NZ. Acne scarring.",
    url: "https://dermnetnz.org/topics/acne-scarring",
    kind: "review",
  },
  // Erectile dysfunction (source pack, docs/sources/erectile-dysfunction.md).
  {
    id: "eau-srh",
    citation:
      "European Association of Urology. EAU Guidelines on Sexual and Reproductive Health. EAU Guidelines Office, Arnhem, Țările de Jos. Ediție online, accesată la 7 octombrie 2026.",
    url: "https://uroweb.org/guidelines/sexual-and-reproductive-health",
    kind: "guideline",
  },
  {
    id: "ema-viagra",
    citation:
      "Agenția Europeană a Medicamentului (EMA). Viagra (sildenafil): EPAR – prezentare generală și informații despre produs (rezumatul caracteristicilor produsului). Actualizat la 17 septembrie 2025.",
    url: "https://www.ema.europa.eu/en/medicines/human/EPAR/viagra",
    kind: "label",
  },
  {
    id: "ema-cialis",
    citation:
      "Agenția Europeană a Medicamentului (EMA). Cialis (tadalafil): EPAR – prezentare generală. Actualizat la 28 ianuarie 2026.",
    url: "https://www.ema.europa.eu/en/medicines/human/EPAR/cialis",
    kind: "label",
  },
  // Romanian dispensing status (source pack, docs/sources/romania-prescription-status.md).
  {
    id: "anmdm-alopexy",
    citation:
      "ANMDM. Alopexy 50 mg/ml soluție cutanată: informații pe ambalaj (medicament care nu se eliberează pe bază de prescripție medicală, OTC).",
    url: "https://anm.ro/_/_AMB/AMB_9951_11.05.17.pdf",
    kind: "label",
  },
  {
    id: "mediately-propecia",
    citation:
      "Mediately (date ANMDM). Propecia 1 mg comprimate filmate: mod de eliberare P-6L (prescripție medicală).",
    url: "https://mediately.co/ro/drugs/Ez4G3iOXanSjjTU4BXw0boiIRWx/propecia-1-mg-compr-film",
    kind: "label",
  },
  {
    id: "anmdm-sildenafil",
    citation:
      "ANMDM. Sildenafil Gemax Pharma 100 mg: informații pe ambalaj (mod de eliberare PRF, prescripție medicală).",
    url: "https://anm.ro/_/_AMB/AMB_14538_08.07.22.pdf",
    kind: "label",
  },
  {
    id: "anmdm-tadalafil",
    citation:
      "ANMDM. Tadalafil Gemax Pharma 10/20 mg: informații pe ambalaj (mod de eliberare PRF, prescripție medicală).",
    url: "https://www.anm.ro/_/_AMB/AMB_16235_17.09.25.pdf",
    kind: "label",
  },
  {
    id: "anmdm-isotretinoin",
    citation:
      "ANMDM. Isotiorga 20 mg capsule moi: informații pe ambalaj (mod de eliberare PRF, prescripție medicală; avertisment privind sarcina).",
    url: "https://anm.ro/_/_AMB/AMB_14555_20.07.22.pdf",
    kind: "label",
  },
  {
    id: "anmdm-epiduo",
    citation:
      "ANMDM. Epiduo 1 mg/25 mg/g gel (adapalen + peroxid de benzoil): informații pe ambalaj (mod de eliberare PRF, prescripție medicală).",
    url: "https://anm.ro/_/_AMB/AMB_14343_24.03.22.pdf",
    kind: "label",
  },
  {
    id: "anmdm-duac",
    citation:
      "ANMDM. Duac 10 mg/g + 30 mg/g gel (clindamicină + peroxid de benzoil): informații pe ambalaj (mod de eliberare PRF, prescripție medicală).",
    url: "https://anm.ro/_/_AMB/AMB_10957_31.08.18.pdf",
    kind: "label",
  },
  {
    id: "mediately-doxiciclina",
    citation: "Mediately (date ANMDM). Doxiciclina Atb 100 mg: mod de eliberare PRF (prescripție medicală).",
    url: "https://mediately.co/ro/drugs/6xPP74GabrQYjMDKY4YldTHpoyL/doxiciclina-atb-100-mg",
    kind: "label",
  },
];

export function getSource(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
