# Legal review needed

Assumption until a Romanian lawyer signs off: public promotion of prescription-only medicines is
restricted (Directive 2001/83/EC art. 88; Romanian implementation in Legea 95/2006, Title XVIII — to be
confirmed).

## What the site does now

- CTAs are condition-led only ("Începe evaluarea", "Evaluare dermatologică online").
- Medicine names (minoxidil, finasteridă) appear only in neutral educational content: the treatment
  information pages and education sections of the condition page and guides. A unit test fails the build
  if a medicine name appears in any page/component code (hero, CTA, pricing are code).
- Treatment pages have no call to action, no price and no purchase language (unit + e2e tested).
- No guarantees, testimonials, before/after images or efficacy percentages.

## Questions for the lawyer

1. Are the treatment-information pages (`/tratamente/minoxidil`, `/tratamente/finasterida`), with the
   medicine name in the H1, acceptable as neutral information on a site that also sells a medical service?
2. Is linking from the condition page's education section to those pages acceptable when the same page has
   an evaluation CTA elsewhere?
3. Telemedicine framework (Legea 95/2006 as amended by OUG 196/2020 and implementing norms): requirements
   for remote dermatology evaluation and e-prescriptions; what must be on the public site.
4. Required company identification and ANPC/SAL information in the footer.
5. Privacy notice and cookie policy final text; GDPR art. 9 basis for the future clinical app.
6. Wording of the pre-launch email signup consent.

## Added for acne and erectile dysfunction (CLAUDE.md §7c)

7. **Prescription-medicine advertising in Romania** (Legea 95/2006, Title XVIII, and ANMDM guidance;
   to be confirmed): are neutral medicine-information pages for sildenafil, tadalafil, isotretinoin,
   oral antibiotics and topical retinoids acceptable on a site that sells a medical service? Today they
   carry no CTA, no price and no purchase language (tested).
8. **Ads for sexual-health services**: Meta's advertising policies restrict ads about sexual health and
   prescription medicines (Meta requires prior written permission / certification for online pharmacies
   and telehealth providers advertising prescription drugs, and restricts sexual-health targeting and
   imagery). Google Ads has similar healthcare-and-medicines rules. Confirm current policy text and any
   certification Telegen needs before running ads for /disfunctie-erectila. Ad landing pages must not
   name a medicine.
9. **Validated questionnaires**: the ED evaluation does NOT reproduce the IIEF-5 / SHIM or any other
   validated instrument; questions are original. Using IIEF-5 would require checking its licence and
   permitted Romanian translation.
10. **Minors**: every evaluation hard-stops under 18. Confirm this policy (acne is common in teenagers).
11. **Isotretinoin**: information only; not prescribed via Telegen (EU pregnancy-prevention programme,
    specialist supervision). Confirm wording with the reviewer.

## Added for the final build (CLAUDE.md §v4)

12. **AI-assisted content (EU AI Act, Regulation (EU) 2024/1689, Art. 50).** /politica-editoriala states
    that first drafts are prepared with AI assistance and then checked by a doctor of the right specialty.
    Confirm whether Art. 50(4) (disclosure of AI-generated text published to inform the public, with the
    exemption for content under human editorial review and responsibility) requires anything more than this
    statement, and from which date the obligation applies to Telegen.
13. **Consumer dispute links in the footer.** The footer links to ANPC's SAL page
    (https://anpc.ro/ce-este-sal/). Not verified online (network blocked, 2026-10-07). To confirm:
    (a) the current ANPC order on SAL/SOL pictograms and links for traders' websites;
    (b) whether the EU ODR platform link is still required. Our understanding is that the EU ODR platform
    was discontinued in July 2025 under Regulation (EU) 2024/3228, which would make the ODR/SOL link
    obsolete; the lawyer should confirm and say what replaces it, if anything.
14. **Company identity on the website.** Which identification data Romanian law requires on the site
    (Legea 365/2002 on e-commerce, consumer law): legal name, CUI, Reg. Com. number, registered address,
    contact email, and for a medical provider any authorisation number. Currently shown as TEMPORARY.
15. **Anonymous doctors.** Doctors are not named publicly; patients receive the doctor's name and parafă
    code in the clinical app before the consult (owner decision). Confirm this satisfies Romanian rules on
    medical advertising, telemedicine and patient information, and that "Revizuit medical de un medic
    [specialitate] din echipa Telegen" is an acceptable review statement.
16. **Men's health positioning.** The site positions Telegen as an online clinic for men while the
    hair-loss education also covers women. Confirm the positioning raises no consumer-law issue (no
    misleading suggestion that women are treated, or vice versa), together with the owner's decision on
    whether women are served.

## Added when acne and ED were published (source pack, docs/sources/conflicts-and-decisions.md)

17. **Efficacy percentages on prescription-medicine pages.** The EAU guideline gives response rates for
    sildenafil and tadalafil. Printing them on a site that also offers an ED service could be read as
    promoting a prescription medicine. Until answered, medicine pages explain how the medicine works,
    when it must not be used and its side effects, with no efficacy percentages and no doses.
18. **Medicines not authorised on their own in Romania.** No Romanian-authorised product was confirmed
    for adapalene alone, benzoyl peroxide alone, topical tretinoin, topical clindamycin alone or
    lymecycline. Is a neutral information page about a substance that is available here only in a fixed
    combination (or not at all) acceptable? Current choice: tretinoin is covered on the adapalen page,
    topical clindamycin on the benzoyl peroxide page, each page says plainly what is and is not confirmed
    in Romania, and `prescriptionStatus` is set only where a Romanian product was confirmed.

## Added with the hair-loss hero photo (v4.6)

19. **Stock photo of an identifiable person next to a medical condition.** The hair-loss hero panel shows
    a Pexels photo (Ketut Subiyanto; docs/media-credits.md). The Pexels licence allows commercial use but
    gives no model release and forbids showing identifiable people in a bad light or implying endorsement.
    Showing him beside "Căderea părului" could be read as saying he has hair loss. Mitigations in place: a
    visible caption "Imagine de prezentare. Persoana este model.", no name, quote, before/after or
    result, and the photo is decorative. Question: is this enough under the Pexels terms and Romanian
    image-rights rules (Codul civil art. 73, dreptul la propria imagine), or should we license a photo with a model release that
    covers sensitive (health) use? The switch `heroMedia.hair` in `src/lib/flags.ts` turns it back to
    the illustration with one line.
