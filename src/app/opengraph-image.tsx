import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Telegen — clinică online pentru sănătatea bărbaților";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Telegen", title: "Sănătatea ta, tratată discret, cu un medic alături." });
}
