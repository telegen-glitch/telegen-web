# Romanian prescription status (checked 2026-10-07)

Source of truth: the ANMDM (Agenția Națională a Medicamentului și a Dispozitivelor Medicale)
product labels ("AMB" files on anm.ro), plus Mediately, which republishes ANMDM data. Codes:

- **OTC**: "Medicament care nu se eliberează pe bază de prescripţie medicală."
- **PRF**: prescription that stays at the pharmacy and is not renewable.
- **P-6L**: prescription kept by the pharmacy that can be reused for six months.

Map to schema.org `prescriptionStatus`: OTC → `OTC`; PRF and P-6L → `PrescriptionOnly`.

| Medicine (site page)                                    | Product checked                   | Romanian status                         | schema.org         | Evidence                                                                           |
| ------------------------------------------------------- | --------------------------------- | --------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| minoxidil, topical solution (/tratamente/minoxidil)     | Alopexy 50 mg/ml soluție cutanată | OTC                                     | `OTC`              | https://anm.ro/_/_AMB/AMB_9951_11.05.17.pdf                                        |
| finasteride 1 mg (/tratamente/finasterida)              | Propecia 1 mg                     | P-6L                                    | `PrescriptionOnly` | https://mediately.co/ro/drugs/Ez4G3iOXanSjjTU4BXw0boiIRWx/propecia-1-mg-compr-film |
| sildenafil (/tratamente/sildenafil)                     | Sildenafil Gemax Pharma 100 mg    | PRF                                     | `PrescriptionOnly` | https://anm.ro/_/_AMB/AMB_14538_08.07.22.pdf ; EMA: prescription only              |
| tadalafil (/tratamente/tadalafil)                       | Tadalafil Gemax Pharma 10/20 mg   | PRF                                     | `PrescriptionOnly` | https://www.anm.ro/_/_AMB/AMB_16235_17.09.25.pdf ; EMA: prescription only          |
| isotretinoin, oral (/tratamente/isotretinoin)           | Isotiorga 20 mg capsule moi       | PRF (label carries a pregnancy warning) | `PrescriptionOnly` | https://anm.ro/_/_AMB/AMB_14555_20.07.22.pdf                                       |
| adapalene + benzoyl peroxide (fixed combination)        | Epiduo 1 mg/25 mg/g gel           | PRF                                     | `PrescriptionOnly` | https://anm.ro/_/_AMB/AMB_14343_24.03.22.pdf                                       |
| clindamycin + benzoyl peroxide (fixed combination)      | Duac 10 mg/g + 30 mg/g gel        | PRF                                     | `PrescriptionOnly` | https://anm.ro/_/_AMB/AMB_10957_31.08.18.pdf                                       |
| doxycycline, oral (/tratamente/doxiciclina-limeciclina) | Doxiciclina Atb 100 mg            | PRF                                     | `PrescriptionOnly` | https://mediately.co/ro/drugs/6xPP74GabrQYjMDKY4YldTHpoyL/doxiciclina-atb-100-mg   |

## Not confirmed: VERIFY before publishing `prescriptionStatus`

For these, no Romanian-authorised product was confirmed from here. For each one:

1. If the build environment can reach nomenclator.anm.ro, check it.
2. If a Romanian product exists, set its status.
3. If none is authorised in Romania, say so honestly on the page ("în România este disponibil
   doar în combinație cu …"). Or merge the page into the combination it belongs to, and record
   the decision in STATUS.md.
4. Until then, leave `drug.prescriptionStatus` out (the schema test only checks visible values)
   and list the medicine in docs/open-items.md.

- adapalene alone (/tratamente/adapalen)
- benzoyl peroxide alone (/tratamente/peroxid-de-benzoil). Many BPO products in Romanian
  pharmacies are cosmetics, not authorised medicines. Do not treat a cosmetic as a medicine.
- tretinoin, topical (/tratamente/tretinoin)
- clindamycin, topical alone (/tratamente/clindamicina-topica). The brief already says
  "in combination only"; the Duac and other fixed combinations above are confirmed.
- lymecycline (part of /tratamente/doxiciclina-limeciclina)
