import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Focused full-screen layout for the evaluation: logo and a way out, nothing else. */
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line-soft bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href="/"
            className="-m-2 flex min-h-11 items-center p-2"
            aria-label="Telegen, pagina principală"
          >
            <Logo />
          </Link>
          <Link
            href="/"
            className="-mr-2 flex h-11 items-center gap-2 rounded-pill px-3 text-sm font-medium text-ink-soft hover:bg-mist hover:text-navy-950"
          >
            Închide
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </header>
      <main id="continut" className="flex-1 bg-mist">
        {children}
      </main>
    </>
  );
}
