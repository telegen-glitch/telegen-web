/**
 * Transactional e-mails. They never mention the condition, a medicine, an
 * answer or a diagnosis: the e-mail says something changed and links to the
 * account, where the details are behind sign-in. Inputs are typed so that only
 * a first name and links can be passed in; tests/unit/health-data-scan.test.ts
 * renders every template with sentinel values and fails on any health data.
 */
export interface EmailInput {
  firstName?: string | null;
  /** Absolute link into the account (no query string). */
  link: string;
}

export interface RenderedEmail {
  subject: string;
  text: string;
}

const hello = (i: EmailInput) => (i.firstName ? `Bună, ${i.firstName},` : "Bună,");
const footer =
  "\n\nEchipa Telegen\nAcest mesaj nu conține informații medicale. Detaliile sunt în contul tău.";

export const templates = {
  case_received: (i: EmailInput): RenderedEmail => ({
    subject: "Am primit evaluarea ta",
    text: `${hello(i)}\n\nEvaluarea ta a ajuns la medic. Suma este doar rezervată pe card până la decizia medicului.\nVezi stadiul în cont: ${i.link}${footer}`,
  }),
  doctor_assigned: (i: EmailInput): RenderedEmail => ({
    subject: "Un medic a preluat evaluarea ta",
    text: `${hello(i)}\n\nUn medic Telegen a preluat evaluarea ta. Numele, specialitatea și codul de parafă ale medicului sunt în cont: ${i.link}${footer}`,
  }),
  doctor_message: (i: EmailInput): RenderedEmail => ({
    subject: "Ai un mesaj nou de la medic",
    text: `${hello(i)}\n\nAi un mesaj nou în cont: ${i.link}${footer}`,
  }),
  plan_approved: (i: EmailInput): RenderedEmail => ({
    subject: "Medicul a aprobat planul tău",
    text: `${hello(i)}\n\nMedicul a aprobat planul. Pregătim livrarea, gratuit și discret. Detalii în cont: ${i.link}${footer}`,
  }),
  plan_adjusted: (i: EmailInput): RenderedEmail => ({
    subject: "Medicul îți propune un plan ajustat",
    text: `${hello(i)}\n\nMedicul a ajustat planul. Nu plătești nimic până nu îl accepți. Vezi propunerea în cont: ${i.link}${footer}`,
  }),
  plan_declined: (i: EmailInput): RenderedEmail => ({
    subject: "Decizia medicului",
    text: `${hello(i)}\n\nMedicul a decis că tratamentul online nu este potrivit acum. Rezervarea de pe card a fost anulată integral, nu plătești nimic. Motivul și recomandarea medicului sunt în cont: ${i.link}${footer}`,
  }),
  order_shipped: (i: EmailInput): RenderedEmail => ({
    subject: "Coletul tău a plecat",
    text: `${hello(i)}\n\nColetul a plecat, într-un ambalaj discret. Urmărește-l din cont: ${i.link}${footer}`,
  }),
  checkin_due: (i: EmailInput): RenderedEmail => ({
    subject: "E timpul pentru o scurtă verificare",
    text: `${hello(i)}\n\nMedicul te roagă să răspunzi la câteva întrebări de urmărire, în cont: ${i.link}${footer}`,
  }),
  payment_upcoming: (i: EmailInput): RenderedEmail => ({
    subject: "Următoarea plată",
    text: `${hello(i)}\n\nUrmătoarea plată pentru planul tău se apropie. O poți amâna sau anula din cont, înainte de data plății: ${i.link}${footer}`,
  }),
} as const;

export type TemplateName = keyof typeof templates;
