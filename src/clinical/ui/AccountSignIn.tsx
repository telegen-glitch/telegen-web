"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { signOutAction } from "../intake/actions";
import { SignIn } from "./SignIn";

/** Sign-in on /cont: after the code, the page reloads its server data. */
export function AccountSignIn({ devCode }: { devCode: string | null }) {
  const router = useRouter();
  return <SignIn devCode={devCode} submitLabel="Intră în cont" onSignedIn={() => router.refresh()} />;
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={buttonClasses("quiet", "md")}
      onClick={() =>
        start(async () => {
          await signOutAction();
          router.refresh();
        })
      }
    >
      Ieși din cont
    </button>
  );
}
