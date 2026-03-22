"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("new", "1");
    const cid = searchParams.get("companyId")?.trim();
    if (cid) sp.set("companyId", cid);
    router.replace(`/contacts?${sp.toString()}`);
  }, [router, searchParams]);

  return (
    <main className="p-6 md:p-10">
      <p className="text-sm text-[var(--fg-muted)]">Weiterleitung…</p>
    </main>
  );
}

export default function NewContactRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 md:p-10">
          <p className="text-sm text-[var(--fg-muted)]">Laden…</p>
        </main>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
