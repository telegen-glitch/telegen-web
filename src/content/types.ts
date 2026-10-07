/**
 * Content model. Typed local content now; Sanity documents map onto the same
 * shapes in Phase 5 (see source.ts). Keep these types free of presentation.
 */

export type ISODate = `${number}-${number}-${number}`;

/** Inline text. Supports [label](/internal-or-https-link) and citations like {{cite:olsen-2002}}. */
export type RichText = string;

export type Block =
  | { type: "p"; text: RichText }
  | { type: "list"; ordered?: boolean; items: RichText[] }
  | { type: "callout"; tone: "info" | "caution"; title?: string; text: RichText }
  | { type: "h3"; text: string };

export interface Section {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface Faq {
  question: string;
  answer: RichText;
}

export interface Source {
  id: string;
  /** Citation as printed on the page. */
  citation: string;
  url: string;
  kind: "guideline" | "trial" | "review" | "label" | "organisation";
}

/**
 * Clinical team member (owner decision, CLAUDE.md §v4.D): doctors are never
 * named or pictured publicly. Only an opaque id, the specialty and the
 * credential type live in the repo. The name-to-id log is kept by the owner,
 * privately, outside the repository. Patients receive the doctor's name and
 * parafă code in the clinical app before the consult.
 */
export interface TeamMember {
  kind: "team-member";
  /** Opaque id, e.g. "derm-1". Never derived from a name. */
  id: string;
  specialty: "dermatologie" | "urologie" | "medicina-de-familie";
  credentialType: "medic-specialist" | "medic-primar";
}

export interface Review {
  /** TeamMember.id of the reviewing doctor. */
  reviewerId: string;
  reviewedAt: ISODate;
}

export interface RelatedLink {
  href: string;
  label: string;
  description?: string;
}

/**
 * Structured-data facts for a page. Every value must also appear in the page's
 * visible text (enforced by tests/unit/content.test.ts), never schema-only.
 */
export interface ConditionEntity {
  alternateName?: string[];
  signOrSymptom?: string[];
  riskFactor?: string[];
  possibleTreatment?: string[];
}

export interface DrugEntity {
  activeIngredient: string;
  /** schema.org DrugPrescriptionStatus */
  prescriptionStatus: "PrescriptionOnly" | "OTC";
}

export type DocKind = "condition" | "guide" | "treatment" | "subpage";

/** Role in the internal linking graph (section 8). */
export type GraphRole =
  "condition" | "symptoms" | "causes" | "treatment" | "questions" | "types" | "scars" | "heart";

export interface MedicalDoc {
  kind: DocKind;
  slug: string;
  /** Explicit URL for condition hubs and their subpages (e.g. /acnee/cauze). */
  path?: string;
  /** MedicalCondition details for condition hubs (visible on the page). */
  entity?: ConditionEntity;
  /** Drug details for medicine pages (visible on the page). */
  drug?: DrugEntity;
  graphRole: GraphRole;
  /** Taxonomy: which condition this belongs to. */
  conditionSlug: string;
  title: string;
  /** <title> without the brand suffix. */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Concise answer shown first and used for the description in structured data. */
  summary: RichText;
  sections: Section[];
  faqs: Faq[];
  sourceIds: string[];
  limitations: RichText;
  authorSlug?: string;
  review?: Review;
  publishedAt: ISODate;
  updatedAt: ISODate;
  related: RelatedLink[];
  /** Draft docs are modelled but never routed, listed or put in the sitemap. */
  status: "published" | "draft";
}

export interface TimelineStep {
  period: string;
  title: string;
  text: RichText;
}

/** Treatment approach by category. Titles never name a medicine (section 9.4). */
export interface Approach {
  title: string;
  text: string;
  href: string;
  linkLabel: string;
}

export interface Condition {
  slug: string;
  /** Hub URL, top-level for every condition (/caderea-parului, /acnee, /disfunctie-erectila). */
  basePath: string;
  /** Intent-specific subpages under basePath (types, causes, treatment...). */
  subpages?: MedicalDoc[];
  name: string;
  shortName: string;
  /** Medical name used in structured data, e.g. "Alopecie androgenetică". */
  medicalName: string;
  /** One line for hubs and navigation. */
  teaser: string;
  /** Lower-case form used inside generated sentences and lists ("căderea părului"). */
  inSentence: string;
  /** Per-condition wording for the shared condition template (§v4.C1). */
  presentation: {
    /** Italic accent after the hub H1. */
    heroAccent: string;
    asideTitle: string;
    asideAccent: string;
    /** Condition-led CTA label, e.g. "Evaluare dermatologică online". */
    evaluationLabel: string;
  };
  status: "published" | "draft";
  doc: MedicalDoc;
  /** Month-by-month expectations block on the condition page. */
  timeline?: { heading: string; intro: RichText; steps: TimelineStep[]; sourceIds: string[] };
  /** Approaches section on the condition page. */
  approaches?: Approach[];
  guideSlugs: string[];
  treatmentSlugs: string[];
}
