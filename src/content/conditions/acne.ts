import { draftDoc } from "../drafts";
import type { Condition } from "../types";

/**
 * Acne (CLAUDE.md 7c). Information architecture is final; clinical text is
 * pending sources that can be fetched and read (EuroGuiDerm/S3, NICE NG198,
 * EMA/ANMDM product information). Until then every page stays a draft.
 */
const base = "/acnee";
const sub = (
  slug: string,
  graphRole: Parameters<typeof draftDoc>[0]["graphRole"],
  title: string,
  metaTitle: string,
  metaDescription: string,
) =>
  draftDoc({
    kind: "subpage",
    slug,
    path: `${base}/${slug}`,
    conditionSlug: "acnee",
    graphRole,
    title,
    metaTitle,
    metaDescription,
  });

export const acne: Condition = {
  slug: "acnee",
  basePath: base,
  name: "Acnee",
  shortName: "Acnee",
  medicalName: "Acnee vulgară",
  teaser: "Coșuri, puncte negre și inflamație pe față, spate sau piept, evaluate de un medic dermatolog.",
  status: "draft",
  guideSlugs: [],
  treatmentSlugs: [
    "peroxid-de-benzoil",
    "adapalen",
    "tretinoin",
    "clindamicina-topica",
    "doxiciclina-limeciclina",
    "isotretinoin",
  ],
  doc: draftDoc({
    kind: "condition",
    slug: "acnee",
    path: base,
    conditionSlug: "acnee",
    graphRole: "condition",
    title: "Acnee",
    metaTitle: "Acneea: cauze, tipuri și tratament evaluat de un dermatolog",
    metaDescription:
      "Ce este acneea, ce tipuri există, ce o declanșează și cum se tratează în trepte. Evaluare dermatologică online.",
  }),
  subpages: [
    sub(
      "tipuri",
      "types",
      "Tipurile de acnee",
      "Tipuri de acnee: comedonală, papulo-pustuloasă, nodulară și acneea la adult",
      "Cum recunoști tipurile de acnee și de ce contează pentru tratament: comedonală, papulo-pustuloasă, nodulochistică și acneea la vârstă adultă.",
    ),
    sub(
      "cauze",
      "causes",
      "Cauzele acneei",
      "Cauzele acneei: hormoni, sebum, bacterii și factori declanșatori",
      "De ce apare acneea și ce o poate agrava: hormonii, sebumul, porii blocați, inflamația, unele medicamente și alți factori.",
    ),
    sub(
      "tratament",
      "treatment",
      "Tratamentul acneei",
      "Tratamentul acneei în trepte: topic, combinat, oral",
      "Cum se tratează acneea pas cu pas, de la tratamente topice la combinații și tratament oral, și când e nevoie de dermatolog.",
    ),
    sub(
      "cicatrici",
      "scars",
      "Cicatricile de acnee",
      "Cicatrici de acnee: de ce apar, cum se previn și ce opțiuni există",
      "Ce sunt cicatricile de acnee, cum le previi tratând acneea la timp și ce opțiuni discuți cu medicul dermatolog.",
    ),
  ],
};
