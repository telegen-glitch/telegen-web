import { draftDoc } from "../drafts";
import type { Condition } from "../types";

/**
 * Erectile dysfunction (CLAUDE.md 7c). Information architecture is final;
 * clinical text is pending sources that can be fetched and read (EAU Guidelines
 * on Sexual and Reproductive Health, EMA/ANMDM product information). Drafts
 * until then.
 */
const base = "/disfunctie-erectila";
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
    conditionSlug: "disfunctie-erectila",
    graphRole,
    title,
    metaTitle,
    metaDescription,
  });

export const erectileDysfunction: Condition = {
  slug: "disfunctie-erectila",
  basePath: base,
  name: "Disfuncție erectilă",
  shortName: "Disfuncție erectilă",
  medicalName: "Disfuncție erectilă",
  teaser: "Dificultăți de erecție, evaluate discret de un medic, cu atenție la sănătatea inimii.",
  status: "draft",
  guideSlugs: [],
  treatmentSlugs: ["sildenafil", "tadalafil"],
  doc: draftDoc({
    kind: "condition",
    slug: "disfunctie-erectila",
    path: base,
    conditionSlug: "disfunctie-erectila",
    graphRole: "condition",
    title: "Disfuncție erectilă",
    metaTitle: "Disfuncția erectilă: cauze, tratament și evaluare medicală discretă",
    metaDescription:
      "Ce este disfuncția erectilă, de ce apare, cum se tratează și de ce merită verificată și inima. Evaluare medicală online, discretă.",
  }),
  subpages: [
    sub(
      "cauze",
      "causes",
      "Cauzele disfuncției erectile",
      "Cauzele disfuncției erectile: vasculare, hormonale, psihologice, medicamente",
      "De ce apare disfuncția erectilă: cauze vasculare, hormonale, neurologice, psihologice, medicamente și stil de viață.",
    ),
    sub(
      "tratament",
      "treatment",
      "Tratamentul disfuncției erectile",
      "Tratamentul disfuncției erectile: stil de viață, tratament oral, consiliere",
      "Opțiunile de tratament pentru disfuncția erectilă, de la stilul de viață și tratamentul oral la consiliere și opțiuni de specialitate.",
    ),
    sub(
      "sanatatea-inimii",
      "heart",
      "Disfuncția erectilă și sănătatea inimii",
      "Disfuncția erectilă și inima: de ce poate fi un semnal de avertizare",
      "De ce problemele de erecție pot semnala o boală a vaselor de sânge sau a inimii și ce controale merită făcute.",
    ),
  ],
};
