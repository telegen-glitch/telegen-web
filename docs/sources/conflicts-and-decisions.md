# Conflicts and decisions found while reading the sources (2026-10-07)

Add each open item to docs/open-items.md (owner or doctor) or docs/legal-review-needed.md
(lawyer).

## Doctor decisions

1. **Alpha-blocker hard stop in the ED evaluation.** The site currently hard-stops anyone taking an
   alpha-blocker (src/content/evaluations/erectile-dysfunction.ts). EAU: "there is no current
   limitation in the simultaneous use of α-blockers and PDE5I" (a meta-analysis found no rise in
   hypotension-related adverse events). The Viagra SmPC still says "caution is advised" because of
   possible symptomatic hypotension in a few people. Keep the hard stop (the conservative choice)
   until the reviewing doctor decides between: keep the hard stop, or change it to "medicul va
   evalua" without a stop. Record this as a doctor decision.
2. **Who reviews ED.** CLAUDE.md §7c.G asks for a GP or urologist for ED. The owner's two doctors
   are confirmed only by specialty in the team model. The owner confirms which doctor reviews ED
   pages; the visible review line must show that doctor's real specialty.
3. **Acne red-flag list**: confirm the final list (see acne.md, "When to see a doctor in person").

## Source conflicts (already resolved in the pack)

4. **Oral antibiotic duration for acne**: NHS says 4–6 months; EuroGuiDerm 2025 says limit to
   3 months, longer only as an exception. The site follows EuroGuiDerm (the European guideline).
5. **NICE NG198** could not be fetched (403 from every route tried). EuroGuiDerm 2025 replaces it
   as the primary acne source. Do not cite NICE unless a later session can read it.

## Lawyer questions (add to docs/legal-review-needed.md)

6. **Efficacy percentages on prescription-medicine pages.** EAU gives response rates for sildenafil
   and tadalafil. Printing them on a site that also sells an ED service could be read as promoting a
   prescription medicine. Until the lawyer answers, medicine pages describe how the medicine works,
   when it must not be used and its side effects. They show no efficacy percentages and no doses.
7. **Medicines not authorised alone in Romania** (adapalene alone, BPO alone, topical tretinoin,
   topical clindamycin alone, lymecycline: unconfirmed). Is a neutral information page about a
   substance only available here in combination acceptable, or should it be merged into a
   combination page?

## Owner decisions

8. **Acne audience.** Telegen is positioned as men's health, but acne guidelines include
   women-only options (hormonal contraceptives, spironolactone), and the acne evaluation already
   has a pregnancy red flag. Default in the pack: the acne pages mention women's options neutrally
   in one short paragraph and the evaluation stays open to adults of any sex. The owner can narrow
   this later.
9. **Clascoterone** (EU authorisation 21 October 2025) is not in the EuroGuiDerm algorithm yet.
   Leave it out of the pages.
