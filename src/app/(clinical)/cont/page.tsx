import type { Metadata } from "next";
import Link from "next/link";
import { evaluations } from "@/content/evaluations";
import { authAdapter } from "@/clinical/auth";
import { DEV_CODE } from "@/clinical/auth/dev";
import { ensureAccount } from "@/clinical/intake/account";
import { listCases } from "@/clinical/intake/cases";
import { syncOpenCheckouts } from "@/clinical/payments/stripe-events";
import { AccountSignIn, SignOutButton } from "@/clinical/ui/AccountSignIn";
import { DataRights } from "@/clinical/ui/DataRights";
import { Card, Screen } from "@/clinical/ui/parts";
import { PATIENT_STATUS } from "@/clinical/ui/status";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { notReadyDetail } from "@/clinical/launch";
import { ServiceNotReady } from "@/clinical/ui/ServiceNotReady";

export const metadata: Metadata = { title: "Contul tău", robots: { index: false, follow: false } };

const dateFmt = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage() {
  const auth = authAdapter();
  const session = auth ? await auth.session() : null;

  if (!auth || !session) {
    return (
      <Screen>
        <h1 className="text-display-2">
          Contul tău <span className="accent">Telegen</span>
        </h1>
        <p className="mt-4 text-lead">
          Intră cu adresa de e-mail. Îți trimitem un cod de 6 cifre, fără parolă.
        </p>
        {auth ? (
          <AccountSignIn devCode={auth.kind === "dev" ? DEV_CODE : null} />
        ) : (
          <ServiceNotReady detail={notReadyDetail()} />
        )}
      </Screen>
    );
  }

  const role = await ensureAccount(session);
  // Back from Stripe Checkout: confirm the authorisation even before the webhook arrives.
  if (role === "patient") await syncOpenCheckouts(session);
  const cases = role === "patient" ? await listCases(session) : [];
  const name = (slug: string) => evaluations.find((e) => e.topic === slug)?.name ?? slug;

  return (
    <Screen wide>
      <p className="text-eyebrow text-blue-700">Contul tău</p>
      <h1 className="mt-3 text-display-2">
        Bună, <span className="accent">bine ai revenit.</span>
      </h1>
      <p className="mt-3 text-ink-soft">Ești conectat ca {session.email}.</p>

      {role !== "patient" ? (
        <Card className="mt-8">
          <p className="text-navy-950">Acesta este un cont de echipă.</p>
          <Link
            href={role === "doctor" ? "/medic" : role === "pharmacy" ? "/farmacie" : "/admin"}
            className={buttonClasses("primary", "md", "mt-4")}
          >
            Mergi la panoul tău <Arrow />
          </Link>
        </Card>
      ) : cases.length === 0 ? (
        <Card className="mt-8">
          <p className="text-navy-950">Nu ai încă nicio evaluare.</p>
          <Link href="/evaluare" className={buttonClasses("primary", "md", "mt-4")}>
            Începe evaluarea <Arrow />
          </Link>
        </Card>
      ) : (
        <section aria-labelledby="evaluari" className="mt-10">
          <h2 id="evaluari" className="text-xl font-semibold text-navy-950">
            Evaluările tale
          </h2>
          <ul className="mt-4 space-y-3">
            {cases.map((c) => (
              <li key={c.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-navy-950">
                      {name(c.condition)}
                      {c.test && (
                        <span className="ml-2 rounded-md bg-mist px-1.5 py-0.5 text-xs font-semibold text-ink-soft">
                          TEST
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {PATIENT_STATUS[c.status]} · începută pe {dateFmt.format(new Date(c.createdAt))}
                    </p>
                  </div>
                  {c.status === "draft" || c.status === "awaiting_payment" ? (
                    <Link href="/evaluare" className={buttonClasses("secondary", "md")}>
                      Continuă <Arrow />
                    </Link>
                  ) : (
                    c.status !== "stopped" && (
                      <Link href={`/cont/${c.id}`} className={buttonClasses("secondary", "md")}>
                        Detalii și mesaje <Arrow />
                      </Link>
                    )
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
      {role === "patient" && (
        <section aria-labelledby="datele-tale" className="mt-10">
          <h2 id="datele-tale" className="text-xl font-semibold text-navy-950">
            Datele tale
          </h2>
          <DataRights />
        </section>
      )}
      <div className="mt-10">
        <SignOutButton />
      </div>
    </Screen>
  );
}
