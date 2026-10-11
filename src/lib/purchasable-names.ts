import { content } from "@/content/source";
import { isPurchasable } from "./purchasable";

/** Names of the conditions that can be started now (static, at build time). */
export function purchasableConditionNames(): string[] {
  return content
    .listConditions()
    .filter((c) => isPurchasable(c.slug))
    .map((c) => c.name);
}
