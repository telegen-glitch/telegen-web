import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { StartButton } from "@/components/topic/StartButton";
import { Logo } from "@/components/ui/Logo";
import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { isEnabled } from "@/lib/flags";
import { footerNav } from "@/lib/nav";

/** Real accounts only. Rendered when the socialLinks flag is on and this list is filled. */
const socials: { label: string; href: string }[] = [];

export function Footer() {
  const legal = footerNav.find((c) => c.heading === "Legal")?.links ?? [];
  const columns = footerNav.filter((c) => c.heading !== "Legal");

  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-page pt-14 pb-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo inverse />
            <p className="mt-5 text-[1.375rem] leading-snug font-semibold tracking-tight">
              Sănătatea ta, tratată discret,{" "}
              <span className="accent text-blue-200">cu un medic alături.</span>
            </p>
            <StartButton variant="inverse" size="md" className="mt-7" />
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
                        className="flex min-h-11 items-center text-[0.9375rem] text-white/85 hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-eyebrow text-white/55">Ajutor</h2>
              <ul className="mt-3">
                <li>
                  <Link
                    href="/ghiduri/caderea-parului-intrebari-frecvente"
                    className="flex min-h-11 items-center text-[0.9375rem] text-white/85 hover:text-white"
                  >
                    Întrebări frecvente
                  </Link>
                </li>
                <li>
                  <CookieSettingsButton className="flex min-h-11 items-center text-left text-[0.9375rem] text-white/85 hover:text-white" />
                </li>
              </ul>
              {isEnabled("socialLinks") && socials.length > 0 && (
                <ul className="mt-4 flex gap-2" aria-label="Rețele sociale">
                  {socials.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        rel="noopener noreferrer"
                        className="flex h-11 items-center rounded-pill border border-white/20 px-4 text-sm hover:border-white"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/15 pt-8 text-xs leading-5 text-white/60">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://anpc.ro/ce-este-sal/"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 hover:text-white"
              >
                ANPC – Soluționarea alternativă a litigiilor
              </a>
            </li>
          </ul>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="max-w-xl">
              <CompanyIdentity tone="dark" />
            </div>
            <p className="max-w-md md:text-right">
              Informațiile de pe acest site au scop educativ și nu înlocuiesc consultul medical. În caz de
              urgență, sună la 112. © {new Date().getFullYear()} Telegen
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
