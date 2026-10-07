# Hair loss: citations for the 8 PENDING_CITATION sections (fetched 2026-10-07)

Write new citations in the same Romanian style as the existing entries in src/content/sources.ts.

## New sources (add to src/content/sources.ts)

| id                     | kind         | citation                                                                                                                            | url                                                            |
| ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `statpearls-te`        | review       | Hughes EC, Syed HA, Saleh D. Telogen Effluvium. În: StatPearls. Treasure Island (FL): StatPearls Publishing; actualizat 1 mai 2024. | https://www.ncbi.nlm.nih.gov/books/NBK430848/                  |
| `aad-hair-shedding`    | organisation | American Academy of Dermatology. Do you have hair loss or hair shedding?                                                            | https://www.aad.org/public/diseases/hair-loss/insider/shedding |
| `aad-hair-loss-causes` | organisation | American Academy of Dermatology. Hair loss: who gets and causes.                                                                    | https://www.aad.org/public/diseases/hair-loss/causes/18-causes |

## Existing sources verified today

- `statpearls-aga`: page exists; Ho CH, Sood T, Zito PM; last updated 7 January 2024. You may
  change "actualizat periodic" to "actualizat 7 ianuarie 2024".
- `ema-finasteride-2025`: page exists ("Finasteride- and dutasteride-containing medicinal products
  – referral"). The procedure started on 3 October 2024; the European Commission decided on
  22 August 2025. EMA confirmed suicidal thoughts as a side effect of finasteride 1 mg and 5 mg,
  with unknown frequency. The finasteride 1 mg pack now carries a patient card; patients should
  seek medical advice for mood changes, depression or suicidal thoughts. Check that
  /tratamente/finasterida says this and dates it correctly.
- `kanti-2018`, `olsen-2002`, `kaufman-1998`, `hamilton-1951`, `norwood-1975`, `ludwig-1977`: DOIs
  were not re-checked from here (publisher sites). Keep them on the open-items list for the
  reviewer.

## What the new sources support

`statpearls-te`:

- Triggers: "acute febrile illness, severe infection, major surgery, severe trauma, postpartum
  hormonal changes …, hypothyroidism", crash dieting, low protein intake, iron deficiency, and some
  medicines (e.g. beta-blockers, retinoids).
- Shedding starts about 3 months after the trigger, with a range of 1 to 6 months. It is diffuse.
- A follicle produces hair for "almost 4 years" and then rests for "about 4 months".
- Regrowth can take "up to 6 months to restart and even longer for the growth to be appreciated".
- Blood tests (thyroid, iron/ferritin) are recommended when there is a clinical concern.

`aad-hair-shedding`:

- Shedding 50–100 hairs a day is normal; more than that is excessive shedding (telogen effluvium).
- Triggers: significant weight loss, childbirth, high stress, fever or illness, surgery, stopping
  birth control pills. People "notice the excessive hair shedding a few months after the stressful
  event". After childbirth, shedding often peaks around four months and settles within 6–9 months.
- Shedding is temporary; hair loss is different and needs a dermatologist to tell them apart.

`aad-hair-loss-causes`:

- Tight hairstyles: "the continual pulling can lead to permanent hair loss" (traction alopecia).
- Too little iron, protein, zinc or biotin can cause hair loss; thyroid disease can thin hair and
  treatment can reverse it; PCOS can include hair loss; alopecia areata is the immune system
  attacking hair follicles; a scalp infection causes "scaly and sometimes inflamed areas"; some
  medicines cause hair loss, and people should not stop a medicine before talking to their doctor.

`statpearls-aga`:

- Differential diagnosis: alopecia areata, anagen effluvium, telogen effluvium, systemic disease,
  syphilis; thyroid, iron and blood tests to rule out other causes.
- Alopecia areata shows "exclamation point hairs" (short broken hairs).
- Progression is tracked with the Norwood-Hamilton (men) and Ludwig (women) scales.
- Minoxidil: most common side effects are itching and local irritation, with flaking.
- Finasteride: sexual side effects; contraindicated in women who may become pregnant because of
  the risk to a male fetus.

## Section-by-section fixes

| Section                                         | Cite                                                                                                   | Change the text                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caderea-parului#cauze`                         | `kanti-2018` or `statpearls-aga` (genetics + androgens); `statpearls-te` (other causes)                | Remove "Nu este provocată de spălatul frecvent, de purtarea șepcii sau de produsele de styling": no source supports it.                                                                                                                                                                                       |
| `semnele-alopeciei-androgenetice#alte-cauze`    | `aad-hair-loss-causes`, `statpearls-aga`, `aad-hair-shedding`                                          | Patches → alopecia areata; broken short hairs → alopecia areata; redness/scale/crusts → scalp infection; sudden heavy shedding → shedding/telogen effluvium. In the last bullet, keep only what a source supports (thyroid, PCOS). Remove "oboseală marcată, scădere în greutate" unless you can source them. |
| `semnele-alopeciei-androgenetice#urmarire`      | `statpearls-aga` (progression is tracked over time with scales); `statpearls-te` (changes take months) | Keep the photo tips as practical advice. Cite only the claim that change is slow and measured over months.                                                                                                                                                                                                    |
| `cauzele-caderii-parului#temporare`             | `statpearls-te`, `aad-hair-shedding`                                                                   | Fine as written for triggers, delay and regrowth. Remove "Uneori, un efluviu telogen scoate la iveală o alopecie androgenetică existentă" unless a source is found.                                                                                                                                           |
| `cauzele-caderii-parului#medicale`              | `statpearls-te`, `aad-hair-loss-causes`, `statpearls-aga`                                              | Remove "mai frecvente la femeile cu menstruații abundente" (unsourced). Scarring alopecia: cite `statpearls-aga`. Keep the in-person callout.                                                                                                                                                                 |
| `cauzele-caderii-parului#mituri`                | `aad-hair-loss-causes` (traction)                                                                      | Remove the claims about washing, caps, hair dryers and gel (unsourced). Rename the section to something like "Coafurile care trag de păr" and keep the traction-alopecia content, or merge it into #medicale. Update the H2 and the test key.                                                                 |
| `caderea-parului-intrebari-frecvente#normal`    | `aad-hair-shedding`, `statpearls-te`                                                                   | Add "50–100 fire pe zi". Remove "sfârșitul verii" (no source on seasonal shedding).                                                                                                                                                                                                                           |
| `caderea-parului-intrebari-frecvente#siguranta` | `kanti-2018`, `statpearls-aga`, `ema-finasteride-2025`                                                 | Fine as written; add the citations.                                                                                                                                                                                                                                                                           |

After all 8 are cited, delete PENDING_CITATION from tests/unit/content.test.ts.
