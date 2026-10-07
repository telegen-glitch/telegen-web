import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

/** Visible breadcrumbs and matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Acasă", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-ink-soft">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={c.href}
                      className="inline-flex min-h-6 items-center hover:text-navy-950 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
