import { content } from "@/content/source";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Telegen — afecțiune";
export const size = ogSize;
export const contentType = ogContentType;
export { generateStaticParams } from "./page";

export default async function Image({ params }: { params: Promise<{ condition: string }> }) {
  const { condition } = await params;
  const c = content.listConditions().find((x) => x.basePath === `/${condition}`);
  return renderOg({ eyebrow: c?.presentation.evaluationLabel ?? "Telegen", title: c?.name ?? "Telegen" });
}
