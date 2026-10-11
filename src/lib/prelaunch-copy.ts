/**
 * Every pre-launch string in one place (CLAUDE.md v4.7). They render only when
 * siteConfig.launchState is "prelaunch", a fallback mode that is never the
 * default. tests/unit/launch-copy.test.ts keeps these phrases out of every other
 * source file, and the launch copy checks (scripts/launch-copy-check.mjs after
 * the build, and the e2e suite) keep them out of every page in the "open" state.
 */
export const prelaunchCopy = {
  announcement: "Telegen este în pre-lansare: serviciul medical nu este încă deschis.",
  announcementLink: "Anunță-mă",
  evaluationIntroNote: "Serviciul medical nu este încă deschis. Acum poți vedea cum arată evaluarea.",
  endTitle: "Serviciul nu este",
  endAccent: "încă deschis",
  endText:
    "Mulțumim că ai parcurs evaluarea. Telegen este în pre-lansare, așa că răspunsurile tale nu au fost trimise unui medic și nu au fost salvate. Când închizi pagina, ele dispar.",
  endReadMoreSuffix: "sau te putem anunța când pornim.",
  notifyHeading: "Anunță-mă la lansare",
  notifyButton: "Anunță-mă",
  notifyOk: "Gata. Îți scriem când serviciul se deschide.",
  notifyDisabled:
    "Înscrierea pentru anunț nu este încă activă, așa că adresa ta nu a fost salvată. Revino curând.",
  closingCta: "Până la lansarea serviciului, răspunsurile la evaluare nu sunt trimise și nici salvate.",
  homeFaq: {
    question: "Telegen funcționează deja?",
    answer:
      "Nu încă. Site-ul este în pre-lansare: poți citi ghidurile și poți parcurge evaluarea ca să vezi cum arată, dar răspunsurile nu sunt trimise nimănui. Te putem anunța când serviciul medical se deschide.",
  },
  legalNote:
    "Serviciul medical nu este încă deschis. Acești termeni se aplică de la deschiderea lui; până atunci, site-ul are doar rol de informare.",
  evaluationMeta:
    "Răspunde la câteva întrebări despre căderea părului, acnee sau disfuncția erectilă. În pre-lansare, răspunsurile nu sunt trimise și nici salvate.",
} as const;
