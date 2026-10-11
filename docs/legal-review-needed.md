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
    contact email, and for a medical provider any authorisation number. Filled from src/lib/launch-config.ts
    (owner-only markers on previews; the launch lock blocks production until supplied).
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

## Added for the launch state (CLAUDE.md v4.7)

The site now reads as the live service. Production cannot launch until the owner sets
`legalApproved: true` in `src/lib/launch-config.ts`, after the lawyer has signed off the items below.

20. **REQUIRES LAWYER SIGN-OFF: /termeni-si-conditii (launch version, 2026-10-10).** Describes the live
    service: the online evaluation, the clinical app, adults only (18+), prices on /cum-functioneaza and
    in the app, online payment in the app, cancellation (free before payment; after payment, the
    conditions shown in the app before paying, within the law), complaints, ANPC and SAL. Open points:
    (a) the right of withdrawal under OUG 34/2014: does the healthcare exclusion apply to the evaluation,
    and what must be said; (b) the refund policy itself is an owner + lawyer decision and is not stated on
    the site; (c) telemedicine information the law requires on the site (see item 3).
21. **REQUIRES LAWYER SIGN-OFF: /politica-de-confidentialitate (launch version, 2026-10-10).** Covers the
    site (no health data; the evaluation stays in the browser; only the condition is handed over) and the
    clinical app (account data; health data under art. 9(2)(a) and (h); payment data held by the payment
    processor; EU hosting, encryption, processors under contract; retention per medical-records law;
    rights; ANSPDCP). These describe the app as designed in docs/clinical-app-architecture.md: confirm
    each matches the real app before launch, and add the DPO contact if one is required.
22. **REQUIRES LAWYER SIGN-OFF: /politica-cookie (launch version, 2026-10-10).** Only the strictly
    necessary consent cookie on the site; the clinical app's cookies are explained in the app.
23. **REQUIRES LAWYER SIGN-OFF: /politica-editoriala.** Unreviewed pages now show "Scris de echipa
    editorială Telegen pe baza ghidurilor citate · actualizat {dată}" (no review claim) instead of a
    "review pending" badge. Confirm this is acceptable together with item 12 (AI assistance).
24. **Item 6 (pre-launch email consent)** now applies only to the "prelaunch" fallback mode, which is
    not the default.

## v5: clinical flow inside telegen.ro (2026-10-11)

25. **Recorded as reported by the owner, 2026-10-11:** the owner's lawyer confirmed that the
    Fellos-class model (free evaluation → personal proposed plan with the medicine and the price →
    card authorised, not charged → doctor review → capture, prescription and pharmacy delivery, or full
    release when not prescribed) is lawful **if the site describes it exactly**, and that medicine names
    together with a price may appear **only inside the logged-in personal proposal and checkout**.
    Public pages keep the earlier rule: no medicine names in hero, CTA, price or ad blocks; public price
    blocks say "Plan pentru căderea părului". Claude did not see the lawyer's opinion; the owner should
    keep it on file. Still to be confirmed in writing: the prescription format and transmission to the
    pharmacy, the Stripe Connect split with the pharmacy, invoicing (e-Factura), and the terms and
    privacy drafts that describe the flow (marked DRAFT FOR LAWYER).

26. **Consent texts (DRAFT FOR LAWYER).** Before anything is saved, the patient ticks four separate,
    unticked boxes: GDPR art. 9 health data, telemedicine, terms, privacy notice. Each is stored with
    version `2026-10-11` and a timestamp; a withdrawal is a new row. Text: `src/clinical/config/consents.ts`.
    Bump the version when a text changes; patients are asked again. To confirm: wording, whether the
    privacy notice should be an acknowledgement rather than a consent (it is worded "Am citit"), and
    the withdrawal flow (P5).
27. **Answers before the account.** The questionnaire runs in the page's memory until the account and
    the four consents exist; nothing is sent before. A signed-in patient with current consents has every
    answer saved as given; a hard stop then leaves a "stopped" case in the account (no payment). To
    confirm: retention for stopped cases (proposal: delete after 90 days unless the patient asks
    earlier; P5 adds deletion from the account).
28. **Photos.** Hair loss asks for 3 photos (front, top, crown), acne for 1 (face), ED for none. The phone
    re-encodes them (≤1600 px, no EXIF/location) and the server strips metadata again. Stored in a
    private Supabase bucket in Frankfurt; viewed only through 60-second links by the patient and the
    doctor on the case; each view is audited.
29. **Proposal and checkout (P2).** Signed-in only, the proposal names the medicine (e.g. "Finasteridă
    1 mg și minoxidil pentru scalp") next to the price, with purpose, time to results, main side effects
    (incl. the EMA 2025 finasteride warning), links to /tratamente and official product information, what
    the price includes, and: "Decizia finală aparține medicului. Dacă nu primești rețetă, nu plătești
    nimic." No urgency, timers or "cumpără". Checkout: "Suma este doar rezervată pe card până la decizia
    medicului." To confirm: the pre-contract information required for distance contracts (OUG 34/2014,
    incl. whether the right of withdrawal applies to a prescribed, dispensed medicine), and the wording.
30. **A/B first-month price.** Half of new patients see 320 lei for the first month, half 199 lei
    (assigned at random on the server, the same patient always sees the same price; the regular price is
    320 lei/month for everyone). To confirm with the lawyer: whether price testing needs disclosure under
    consumer law (OG 21/1992, Law 363/2007 on unfair practices) and in the terms.
31. **Doctor identity and decisions (P3).** When a doctor takes a case, the patient sees the doctor's full
    name, specialty and parafă code in the account and is told by e-mail (without the name). Decline
    reasons shown to the patient: contraindication; needs in-person care; not enough information; not
    indicated; other (explained in a message). The doctor's message includes where to go in person. To
    confirm: wording, and the record-keeping duty for telemedicine consultations (retention of the case,
    messages and prescription).
32. **Prescription format (P3).** Stored as structured items with the doctor's instructions, the doctor's
    name and parafă; the pharmacy sees it in its panel. To confirm with the lawyer and the pharmacy: the
    legally valid format (e.g. electronic prescription), signature, and transmission.
33. **Pharmacy and money flow (P4).** The patient pays Telegen (card captured after approval); the partner
    pharmacy receives its share by Stripe Connect transfer; Telegen invoices the service ("Plan Telegen").
    To confirm: who sells and invoices the medicines (the pharmacy, to the patient?), the contract and
    data-processing agreement with the pharmacy (it receives the prescription, the doctor's name and
    parafă, and the delivery address), and the distance sale of prescription medicines by the pharmacy.
34. **Subscriptions and data rights (P5), DRAFT FOR LAWYER.** The plan renews automatically from the next
    cycle (e-mail 3 days before each charge), can be paused or cancelled in one tap, and needs the doctor's
    re-review every 6 months (charges stop until then). The patient can export all data (JSON), withdraw the
    health-data consent (open cases and plans stop) and delete the account (full erasure only without a
    medical decision or payment; otherwise a recorded request). To confirm: auto-renewal disclosure and
    cancellation terms for distance contracts; retention periods for medical and financial records; what a
    deletion request must erase and when; the wording on the screens.
