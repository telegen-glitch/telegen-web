import type { Metadata } from "next";
import { homeDescription, homeTitle, publishedConditionList } from "@/lib/positioning";
import { pageMetadata } from "@/lib/seo";

/**
 * Titles and descriptions of every non-medical page, in one place so tests and
 * the GEO report can check them (§v4.C6): titles ≤ 60 characters including
 * " | Telegen" (so ≤ 50 here, unless absolute), descriptions 120–160.
 * Medical pages take theirs from content (metaTitle / metaDescription).
 */
export interface StaticMeta {
  title: string;
  description: string;
  /** Title used as-is, without the " | Telegen" suffix. */
  absolute?: boolean;
}

export function staticMeta(path: string): StaticMeta {
  const meta = staticPages()[path];
  if (!meta) throw new Error(`No metadata for ${path}`);
  return meta;
}

export function staticPages(): Record<string, StaticMeta> {
  return {
    "/": { title: homeTitle(), description: homeDescription(), absolute: true },
    "/afectiuni": {
      title: "Afecțiuni tratate online",
      description: `Afecțiunile pentru care Telegen oferă evaluare medicală online: ${publishedConditionList()}. Ce se poate trata, cum și cu ce fel de medic.`,
    },
    "/ghiduri": {
      title: "Ghiduri medicale explicate clar",
      description:
        "Ghiduri medicale cu surse citate despre afecțiunile tratate de Telegen: semne, cauze, opțiuni de tratament și întrebări frecvente, explicate clar.",
    },
    "/tratamente": {
      title: "Informații despre tratamente",
      description:
        "Informații neutre, cu surse, despre substanțele folosite în tratament: cum acționează, ce arată studiile, efecte adverse și limite.",
    },
    "/cum-functioneaza": {
      title: "Cum funcționează evaluarea online",
      description:
        "Pas cu pas: evaluarea online, analiza făcută de un medic cu specialitatea potrivită, planul de tratament și urmărirea. Ce primești și ce nu facem.",
    },
    "/standarde-clinice": {
      title: "Standarde clinice Telegen",
      description:
        "Regulile după care lucrează Telegen: medici cu drept de liberă practică, protocoale clinice scrise, informații medicale cu surse și date protejate.",
    },
    "/echipa-medicala": {
      title: "Echipa medicală Telegen",
      description:
        "Medicii Telegen au drept de liberă practică în România și specialitatea potrivită afecțiunii. Afli numele și parafa medicului înainte de consult.",
    },
    "/evaluare": {
      title: "Evaluare medicală online",
      description:
        "Răspunde la câteva întrebări despre căderea părului, acnee sau disfuncția erectilă. În pre-lansare, răspunsurile nu sunt trimise și nici salvate.",
    },
    "/contact": {
      title: "Contact Telegen",
      description:
        "Cum iei legătura cu Telegen: adresa de e-mail, timpul de răspuns și datele societății. Nu oferim sfaturi medicale prin e-mail; în urgențe sună la 112.",
    },
    "/politica-editoriala": {
      title: "Politica editorială Telegen",
      description:
        "Cum scriem și verificăm informațiile medicale de pe Telegen: surse, revizuire de către medici, actualizări, corecturi și folosirea asistenței AI.",
    },
    "/termeni-si-conditii": {
      title: "Termeni și condiții",
      description:
        "Condițiile de utilizare a site-ului telegen.ro: informații educative, nu sfat medical, pre-lansarea serviciului, date personale și soluționarea litigiilor.",
    },
    "/politica-de-confidentialitate": {
      title: "Politica de confidențialitate",
      description:
        "Cum tratează Telegen datele personale ale vizitatorilor telegen.ro: ce colectăm, ce nu colectăm (date de sănătate), drepturile tale și cum ne contactezi.",
    },
    "/politica-cookie": {
      title: "Politica de cookie-uri",
      description:
        "Ce cookie-uri folosește telegen.ro, de ce sunt necesare, ce cookie-uri de analiză am folosi doar cu acordul tău și cum îți schimbi oricând alegerea.",
    },
  };
}

/** Next.js metadata for a static page, from the central table above. */
export function staticPageMetadata(path: string, options: { indexable?: boolean } = {}): Metadata {
  const m = staticMeta(path);
  return pageMetadata({
    title: m.title,
    description: m.description,
    path,
    absoluteTitle: m.absolute,
    ...options,
  });
}
