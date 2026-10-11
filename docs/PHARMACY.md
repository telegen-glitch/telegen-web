# Partner pharmacy, payment split and invoices (owner)

## 1. The partner pharmacy (in /admin)

/admin → **Farmacii partenere** → name, Stripe Connect account (`acct_…`, step 2) and the e-mail of the
pharmacy's account. The pharmacist signs in at `/farmacie` with an e-mail code and must set up two-factor
sign-in. They see only the prescription, the doctor (name, parafă) and the delivery address: never the
condition, the answers or the photos. They print the packing slip, mark the parcel as shipped with the
courier and AWB (the patient is told), then delivered.

## 2. Stripe Connect (the pharmacy's share of each payment)

1. Stripe → **Connect** → **Get started** → platform/marketplace, Romania.
2. **Accounts** → **Create** → Express account for the pharmacy → send it the onboarding link.
3. When it is complete, copy the account id (`acct_…`) into /admin (step 1).
4. Agree with the pharmacy how much of each plan payment it receives, per product (medicines +
   dispensing + delivery), and send Claude the amounts, e.g. "finasteridă+minoxidil: 120 lei/lună,
   330 lei/3 luni; minoxidil: 70 lei/lună, 190 lei/3 luni". They go into
   `src/clinical/config/pharmacy.ts` (today empty).

While the split is empty, production takes no real payments (the launch check lists it); previews keep
working in Stripe test mode without a split.

## 3. Invoices (SmartBill or Oblio)

The service is invoiced automatically after the payment is captured; the only item is "Plan Telegen".
Until credentials exist, invoices wait as "pending" and are issued later by the scheduled job.

Vercel → **Environment Variables** (Production):

| Name                                 | Value                                    |
| ------------------------------------ | ---------------------------------------- |
| `INVOICE_CIF`                        | the company's CUI (e.g. `RO12345678`)    |
| `INVOICE_SERIES`                     | the invoice series set up in the program |
| `SMARTBILL_EMAIL`, `SMARTBILL_TOKEN` | SmartBill → Contul meu → Integrări → API |
| or `OBLIO_EMAIL`, `OBLIO_SECRET`     | Oblio → Setări → Date cont → API         |

The request formats follow the providers' documentation and are tested only once credentials exist.
