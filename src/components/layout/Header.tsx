import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { conditionNav, evaluationCta, primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { ConditionsMenu, MobileMenu } from "./HeaderMenus";

export function Header() {
  const conditions = conditionNav();
  return (
    <>
      {siteConfig.launchState === "prelaunch" && (
        <div className="bg-navy-950 text-white">
          <p className="container-page py-2 text-center text-xs leading-5 text-white/85">
            Telegen este în pre-lansare. Serviciul medical nu este încă deschis.{" "}
            <Link href="/evaluare" className="font-semibold text-white underline underline-offset-2">
              Află când pornim
            </Link>
          </p>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link
            href="/"
            className="-m-2 flex min-h-11 items-center p-2"
            aria-label="Telegen, pagina principală"
          >
            <Logo />
          </Link>

          <nav aria-label="Navigare principală" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <ConditionsMenu conditions={conditions} />
              </li>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-pill px-4 text-sm font-medium text-ink-soft transition-colors hover:text-navy-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href={evaluationCta.href} size="md" className="hidden sm:inline-flex">
              {evaluationCta.label}
            </ButtonLink>
            <MobileMenu conditions={conditions} links={primaryNav} />
          </div>
        </div>
      </header>
    </>
  );
}
