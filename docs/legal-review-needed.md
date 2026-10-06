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
