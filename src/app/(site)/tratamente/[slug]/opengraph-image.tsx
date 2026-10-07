import { ogContentType, ogSize, renderOg } from "@/lib/og";

/** Medicine pages share one generic image: no medicine name on shareable images (§9.4). */
export const alt = "Telegen — informații despre tratamente";
export const size = ogSize;
export const contentType = ogContentType;
export { generateStaticParams } from "./page";

export default function Image() {
  return renderOg({ eyebrow: "Informații neutre", title: "Ce trebuie să știi despre tratamente" });
}
