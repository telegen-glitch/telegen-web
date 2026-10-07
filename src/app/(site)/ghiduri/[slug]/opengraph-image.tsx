import { content } from "@/content/source";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Telegen — ghid medical";
export const size = ogSize;
export const contentType = ogContentType;
export { generateStaticParams } from "./page";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOg({ eyebrow: "Ghid medical", title: content.getGuide(slug)?.title ?? "Telegen" });
}
