import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  text,
  id,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  text?: ReactNode;
  id?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div data-reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="text-eyebrow text-blue-700">{eyebrow}</p>}
      <h2 id={id} className="mt-3 text-display-2">
        {title} {accent && <span className="accent">{accent}</span>}
      </h2>
      {text && <div className="mt-5 text-lead">{text}</div>}
      {children}
    </div>
  );
}
