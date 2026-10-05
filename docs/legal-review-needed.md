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
