import type { ReactNode } from "react";

/** Visible label for anything not yet confirmed by the owner (section 9.1). */
export function TemporaryBadge({ children = "TEMPORARY" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-amber-800 uppercase">
      {children}
    </span>
  );
}

export function TemporaryNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline gap-2 rounded-lg border border-amber-100 bg-amber-100/40 px-3 py-2 text-xs text-amber-800">
      <TemporaryBadge />
      <span>{children}</span>
    </p>
  );
}
