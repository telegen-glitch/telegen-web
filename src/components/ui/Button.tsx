import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet" | "inverse";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill text-center font-semibold transition-colors duration-200 ease-calm focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-navy-950 text-white hover:bg-navy-800",
  secondary: "border border-navy-950/25 bg-white text-navy-950 hover:border-navy-950",
  quiet: "text-navy-950 underline decoration-navy-950/30 underline-offset-4 hover:decoration-navy-950",
  inverse: "bg-white text-navy-950 hover:bg-blue-50",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm whitespace-nowrap",
  lg: "min-h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "lg", extra = "") {
  const pad = variant === "quiet" ? "min-h-11 px-1 text-base" : sizes[size];
  return `${base} ${variants[variant]} ${pad} ${extra}`.trim();
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className = "", ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
