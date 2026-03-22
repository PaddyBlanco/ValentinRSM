"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Company } from "@/lib/api";
import { fetchCompanies } from "@/lib/api";

const statusLabel: Record<string, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

export default function CompaniesPage() {
  const [rows, setRows] = useState<Company[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await fetchCompanies();
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
        <h1 className="text-xl font-medium">Firmen</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Alle Firmen mit Typ, Status und Kennfarbe.</p>
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      </header>

      <div className="overflow-x-auto border border-[var(--hairline)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] text-xs uppercase tracking-wide text-[var(--fg-muted)]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Typ</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Farbe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--hairline)] last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/companies/${r.id}`} className="hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">{r.type}</td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">{statusLabel[r.status] ?? r.status}</td>
                <td className="px-4 py-3">
                  {r.accentColor ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded border border-[var(--hairline)]"
                        style={{ backgroundColor: r.accentColor }}
                      />
                      <span className="text-xs text-[var(--fg-muted)]">{r.accentColor}</span>
                    </span>
                  ) : (
                    <span className="text-[var(--fg-muted)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !err && (
          <p className="p-6 text-sm text-[var(--fg-muted)]">Noch keine Firmen.</p>
        )}
      </div>
    </main>
  );
}
