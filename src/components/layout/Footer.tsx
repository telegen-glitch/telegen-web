import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { TemporaryBadge } from "@/components/ui/Temporary";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { conditionNav, evaluationCta, footerNav } from "@/lib/nav";

export function Footer() {
  const columns = footerNav.map((col) =>
    col.heading === "Afecțiuni"
      ? { ...col, links: [...conditionNav().map(({ href, label }) => ({ href, label })), ...col.links] }
      : col,
  );

  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-page pt-14 pb-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <Logo inverse />
            <p className="mt-5 text-sm leading-6 text-white/70">
              Clinică dermatologică online. Evaluare făcută de medici, tratament explicat clar și urmărire pe
              termen lung. Începem cu căderea părului.
            </p>
            <ButtonLink href={evaluationCta.href} variant="inverse" size="md" className="mt-6">
              {evaluationCta.label}
            </ButtonLink>
          </div>

          <nav aria-label="Navigare în subsol" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="text-eyebrow text-white/55">{col.heading}</h2>
                <ul className="mt-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="flex min-h-11 items-center text-sm text-white/85 hover:text-white hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  {col.heading === "Legal" && (
                    <li>
                      <CookieSettingsButton className="flex min-h-11 items-center text-left text-sm text-white/85 hover:text-white hover:underline" />
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 border-t border-white/15 pt-8 text-xs leading-5 text-white/60">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="flex flex-wrap items-center gap-2">
                <TemporaryBadge />
                <span>
                  Date de identificare ale societății (denumire, CUI, nr. Registrul Comerțului, sediu,
                  contact) se completează înainte de lansare.
                </span>
              </p>
              <p>
                Informațiile de pe acest site au scop educativ și nu înlocuiesc consultul medical. În caz de
                urgență, sună la 112.
              </p>
            </div>
            <div className="space-y-2 md:text-right">
              <p className="flex flex-wrap items-center gap-2 md:justify-end">
                <TemporaryBadge />
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-white"
                  rel="noopener noreferrer"
                >
                  ANPC – Soluționarea alternativă a litigiilor
                </a>
              </p>
              <p>© {new Date().getFullYear()} Telegen</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
