import type { Metadata } from "next";
import type { Faq, MedicalDoc } from "@/content/types";
import { plainText } from "@/lib/rich-text";
import { absoluteUrl, isSiteIndexable, siteConfig } from "@/lib/site";

interface PageMetaInput {
  /** Title without brand; the root layout template appends " | Telegen". */
  title: string;
  description: string;
  path: string;
  /** Page-level permission to index. The site-level switch still applies. */
  indexable?: boolean;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  /**
   * Use the site-wide OG image. Pages whose route segment has its own
   * opengraph-image file pass false, otherwise this would override it.
   */
  defaultOgImage?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  indexable = true,
  type = "website",
  absoluteTitle = false,
  defaultOgImage = true,
}: PageMetaInput): Metadata {
  const index = indexable && isSiteIndexable();
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: absoluteTitle ? title : `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(defaultOgImage
        ? { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }] }
        : {}),
    },
    twitter: { card: "summary_large_image" },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: isSiteIndexable(), nocache: true },
  };
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  // Only facts we can stand behind: no address, phone or ratings until supplied.
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organizatie`,
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.url}/#organizatie` },
  };
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

/** FAQPage only for FAQs that are visible on the same page. */
export function faqJsonLd(faqs: Faq[]): JsonLd | null {
  // An answer that is only an owner-only marker (previews) has no text to publish.
  const items = faqs.filter((f) => plainText(f.answer) !== "");
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: plainText(f.answer) },
    })),
  };
}

/**
 * MedicalWebPage built from the same doc the page renders. `reviewedBy` and
 * `lastReviewed` appear only when the review is real (see indexing.ts).
 */
export function medicalPageJsonLd(
  doc: MedicalDoc,
  path: string,
  conditionMedicalName: string,
  /** Only when the visible "Revizuit medical…" line is shown (real review). */
  reviewedAt?: string,
): JsonLd {
  const about =
    doc.kind === "treatment"
      ? {
          "@type": "Drug",
          name: doc.title,
          ...(doc.drug ? { activeIngredient: doc.drug.activeIngredient } : {}),
          ...(doc.drug?.prescriptionStatus
            ? { prescriptionStatus: `https://schema.org/${doc.drug.prescriptionStatus}` }
            : {}),
        }
      : {
          "@type": "MedicalCondition",
          name: conditionMedicalName,
          ...(doc.entity?.alternateName?.length ? { alternateName: doc.entity.alternateName } : {}),
          ...(doc.entity?.signOrSymptom?.length
            ? {
                signOrSymptom: doc.entity.signOrSymptom.map((name) => ({
                  "@type": "MedicalSignOrSymptom",
                  name,
                })),
              }
            : {}),
          ...(doc.entity?.riskFactor?.length
            ? { riskFactor: doc.entity.riskFactor.map((name) => ({ "@type": "MedicalRiskFactor", name })) }
            : {}),
          ...(doc.entity?.possibleTreatment?.length
            ? {
                possibleTreatment: doc.entity.possibleTreatment.map((name) => ({
                  "@type": "MedicalTherapy",
                  name,
                })),
              }
            : {}),
        };
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${absoluteUrl(path)}#pagina`,
    url: absoluteUrl(path),
    name: doc.h1,
    headline: doc.h1,
    description: plainText(doc.summary),
    inLanguage: siteConfig.language,
    datePublished: doc.publishedAt,
    dateModified: doc.updatedAt,
    about,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    publisher: { "@id": `${siteConfig.url}/#organizatie` },
    // Doctors are never named (§v4.D): the reviewer is the organisation, never a Person.
    ...(reviewedAt
      ? { lastReviewed: reviewedAt, reviewedBy: { "@id": `${siteConfig.url}/#organizatie` } }
      : {}),
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
