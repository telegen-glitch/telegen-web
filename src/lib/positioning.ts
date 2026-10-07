import { content } from "@/content/source";
import { siteConfig } from "@/lib/site";

/**
 * Site positioning (§v4.C3): Telegen is an online men's health clinic. Lists of
 * conditions are generated from published content, so metadata and hero copy
 * stay true as conditions are published. Never names a medicine.
 */
export function publishedConditionList(): string {
  const names = content.listConditions().map((c) => c.inSentence);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} și ${names[names.length - 1]}`;
}

export function homeTitle(): string {
  return `${siteConfig.name} — clinică online pentru sănătatea bărbaților`;
}

export function homeDescription(): string {
  return `Clinică online pentru bărbați din România: evaluare făcută de un medic pentru ${publishedConditionList()}, plan de tratament clar și urmărire, de pe telefon.`;
}
