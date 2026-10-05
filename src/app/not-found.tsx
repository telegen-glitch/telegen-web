import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Pagina nu a fost găsită", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-page py-20 md:py-32">
      <p className="text-eyebrow text-blue-700">Eroare 404</p>
      <h1 className="mt-3 max-w-2xl text-display-1">Pagina nu există sau a fost mutată</h1>
      <p className="mt-5 max-w-xl text-lg text-ink-soft">
        Verifică adresa sau pornește de la una dintre paginile de mai jos.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Pagina principală</ButtonLink>
        <ButtonLink href="/afectiuni/caderea-parului" variant="secondary">
          Căderea părului
        </ButtonLink>
      </div>
      <p className="mt-8 text-sm text-ink-muted">
        Cauți un ghid?{" "}
        <Link href="/ghiduri" className="text-blue-700 underline underline-offset-2">
          Vezi toate ghidurile
        </Link>
        .
      </p>
    </div>
  );
}
