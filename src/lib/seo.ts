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
}

export function pageMetadata({
  title,
  description,
  path,
  indexable = true,
  type = "website",
  absoluteTitle = false,
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
    },
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
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
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
  realReviewer?: { name: string; credential: string; reviewedAt: string },
): JsonLd {
  const about =
    doc.kind === "treatment"
      ? { "@type": "Drug", name: doc.title }
      : { "@type": "MedicalCondition", name: conditionMedicalName };
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
    ...(realReviewer
      ? {
          lastReviewed: realReviewer.reviewedAt,
          reviewedBy: {
            "@type": "Person",
            name: realReviewer.name,
            jobTitle: realReviewer.credential,
          },
        }
      : {}),
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
