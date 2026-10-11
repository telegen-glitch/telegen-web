import type { Metadata } from "next";
import Link from "next/link";
import { Screen } from "@/clinical/ui/parts";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Cont șters", robots: { index: false, follow: false } };

/** Shown after a full account deletion (the session no longer exists). */
export default function DeletedPage() {
  return (
    <Screen>
      <h1 className="text-display-2">
        Contul tău <span className="accent">a fost șters.</span>
      </h1>
      <p className="mt-4 text-lead">Contul și datele tale au fost șterse, inclusiv fotografiile.</p>
      <Link href="/" className={buttonClasses("primary", "lg", "mt-8")}>
        Pagina principală
      </Link>
    </Screen>
  );
}
