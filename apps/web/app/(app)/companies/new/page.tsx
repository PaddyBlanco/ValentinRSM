"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Alte URL: leitet auf die Firmenliste mit Modal-Parameter weiter. */
export default function NewCompanyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/companies?new=1");
  }, [router]);

  return (
    <main className="p-6 md:p-10">
      <p className="text-sm text-[var(--fg-muted)]">Weiterleitung…</p>
    </main>
  );
}
