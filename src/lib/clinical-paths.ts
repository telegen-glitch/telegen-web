/**
 * Path prefixes of the clinical area (CLAUDE.md v5). Public code may know the
 * paths (to link to /evaluare, to keep crawlers and analytics out) but never
 * imports clinical code. Every one of these is dynamic, noindex, disallowed in
 * robots.txt, absent from the sitemap and served with a stricter CSP.
 */
export const CLINICAL_PREFIXES = ["/evaluare", "/cont", "/medic", "/farmacie", "/admin"] as const;

export function isClinicalPath(pathname: string): boolean {
  return CLINICAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** The inline script in the root layout. Its hash is allowed by the clinical CSP. */
export const JS_CLASS_SCRIPT = "document.documentElement.classList.add('js')";
