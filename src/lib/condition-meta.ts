import type { Metadata } from "next";
import type { Condition, MedicalDoc } from "@/content/types";
import { hrefForDoc } from "@/content/source";
import { reviewContext } from "@/lib/medical";
import { pageMetadata } from "@/lib/seo";

export function conditionMetadata(condition: Condition): Metadata {
  return docMetadata(condition.doc, condition.basePath);
}

export function docMetadata(doc: MedicalDoc, path = hrefForDoc(doc)): Metadata {
  return pageMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path,
    indexable: reviewContext(doc).indexable,
    type: "article",
  });
}
