import { content } from "@/content/source";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Telegen — ghid medical";
export const size = ogSize;
export const contentType = ogContentType;
export { generateStaticParams } from "./page";

export default async function Image({ params }: { params: Promise<{ condition: string; sub: string }> }) {
  const { condition, sub } = await params;
  const c = content.listConditions().find((x) => x.basePath === `/${condition}`);
  const doc = c ? content.getSubpage(c.slug, sub) : undefined;
  return renderOg({ eyebrow: c?.name ?? "Telegen", title: doc?.title ?? "Telegen" });
}
