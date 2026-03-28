"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { LogoMark } from "@/components/branding/logo-mark";

export function LoginClient({ callbackUrl }: { callbackUrl: string }) {
  const { status } = useSession();
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === "true";

  useEffect(() => {
    if (authDisabled && status !== "loading") {
      window.location.replace(callbackUrl);
    }
  }, [authDisabled, status, callbackUrl]);

  if (authDisabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[var(--fg-muted)]">Anmeldung ist in diesem Modus deaktiviert …</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[var(--fg-muted)]">Du bist angemeldet.</p>
        <Link href="/" className="text-sm font-medium text-[var(--fg)] underline">
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <LogoMark className="h-10 w-auto max-w-[240px]" />
        <h1 className="text-lg font-semibold text-[var(--fg)]">Anmeldung</h1>
        <p className="max-w-sm text-sm text-[var(--fg-muted)]">
          Melde dich mit deinem Microsoft-Konto (Entra ID) an.
        </p>
      </div>
      <button
        type="button"
        onClick={() => signIn("microsoft-entra-id", { callbackUrl })}
        className="inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-lg border border-[var(--hairline)] bg-[var(--hover)] px-6 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--hairline)]"
      >
        Mit Microsoft anmelden
      </button>
    </div>
  );
}
