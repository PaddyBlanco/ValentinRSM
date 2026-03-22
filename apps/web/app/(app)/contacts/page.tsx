"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Contact } from "@/lib/api";
import { fetchContacts } from "@/lib/api";

export default function ContactsPage() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await fetchContacts();
        if (!c) {
          setRows(data);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!c) setErr(e instanceof Error ? e.message : "Fehler");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <h1 className="text-xl font-medium">Kontakte</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Alle Kontakte alphabetisch.</p>
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      </header>

      <div className="overflow-x-auto border border-[var(--hairline)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] text-xs uppercase tracking-wide text-[var(--fg-muted)]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Firma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--hairline)] last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${r.id}`} className="hover:underline">
                    {r.firstName} {r.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">{r.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${r.companyId}`} className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
                    Öffnen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !err && (
          <p className="p-6 text-sm text-[var(--fg-muted)]">Keine Kontakte.</p>
        )}
      </div>
    </main>
  );
}
