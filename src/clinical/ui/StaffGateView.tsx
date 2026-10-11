import { notReadyDetail } from "../launch";
import { authAdapter } from "../auth";
import { DEV_CODE, DEV_TOTP } from "../auth/dev";
import type { StaffGate } from "../staff";
import { AccountSignIn, SignOutButton } from "./AccountSignIn";
import { Card, Screen } from "./parts";
import { ServiceNotReady } from "./ServiceNotReady";
import { TwoFactor } from "./TwoFactor";

/** What a staff area shows before access is granted: sign-in, 2FA, or "no access". */
export function StaffGateView({ gate, title }: { gate: Exclude<StaffGate, { state: "ok" }>; title: string }) {
  const dev = authAdapter()?.kind === "dev";
  return (
    <Screen>
      <h1 className="text-display-2">{title}</h1>
      {gate.state === "unconfigured" && <ServiceNotReady detail={notReadyDetail()} />}
      {gate.state === "signed_out" && (
        <>
          <p className="mt-4 text-lead">
            Intră cu adresa de e-mail a contului tău. Îți trimitem un cod de 6 cifre.
          </p>
          <AccountSignIn devCode={dev ? DEV_CODE : null} />
        </>
      )}
      {gate.state === "needs_2fa" && (
        <>
          <p className="mt-4 text-lead">Al doilea pas: confirmă cu aplicația de autentificare.</p>
          <TwoFactor enrolled={gate.enrolled} devCode={dev ? DEV_TOTP : null} />
        </>
      )}
      {gate.state === "forbidden" && (
        <Card className="mt-8">
          <p className="text-navy-950">Acest cont nu are acces aici.</p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </Card>
      )}
    </Screen>
  );
}
