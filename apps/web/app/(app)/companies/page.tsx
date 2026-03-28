"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CompanyForm } from "@/components/companies/company-form";
import { Modal } from "@/components/ui/modal";
import type { Company } from "@/lib/api";
import { createCompany, fetchCompanies } from "@/lib/api";
import { companyStatusLabel, companyStatusRank, companyStatusTagClass } from "@/lib/company-status";

function CompaniesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus !== "loading";
  const [rows, setRows] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);

  useEffect(() => {
    if (!sessionReady) return;
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
  }, [sessionReady]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? rows
      : rows.filter((r) => {
          const st = companyStatusLabel[r.status];
          return (
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            st.toLowerCase().includes(q)
          );
        });
    return [...list].sort((a, b) => {
      const byStatus = companyStatusRank(a.status) - companyStatusRank(b.status);
      if (byStatus !== 0) return byStatus;
      return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
    });
  }, [rows, query]);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    setCreateOpen(true);
    setCreateFormKey((k) => k + 1);
    router.replace("/companies", { scroll: false });
  }, [searchParams, router]);

  return (
    <main className="p-4 md:p-8">
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-3">
          <h1 className="text-lg font-medium">Firmen</h1>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--hairline)]"
            onClick={() => {
              setCreateFormKey((k) => k + 1);
              setCreateOpen(true);
            }}
          >
            Neu
          </button>
        </header>

        {err && <p className="mb-2 text-xs text-red-500">{err}</p>}

        <div className="mb-2">
          <label htmlFor="company-search" className="sr-only">
            Firmen durchsuchen
          </label>
          <input
            id="company-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            autoComplete="off"
            className="w-full max-w-md rounded border border-[var(--hairline)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--fg-muted)]"
          />
        </div>

        <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/companies/${r.id}`}
                className="flex items-start justify-between gap-3 py-1.5 pr-1 text-sm hover:bg-[var(--hover)]"
              >
                <span className="flex min-w-0 flex-1 items-start gap-2">
                  {r.accentColor ? (
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                      style={{ backgroundColor: r.accentColor }}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-30"
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium leading-tight">{r.name}</span>
                    <span className="mt-0.5 block text-xs leading-tight text-[var(--fg-muted)]">{r.type}</span>
                  </span>
                </span>
                <span className={`shrink-0 self-start ${companyStatusTagClass(r.status)}`}>
                  {companyStatusLabel[r.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {rows.length === 0 && !err && (
          <p className="mt-3 text-xs text-[var(--fg-muted)]">Noch keine Firmen.</p>
        )}
        {rows.length > 0 && filtered.length === 0 && (
          <p className="mt-3 text-xs text-[var(--fg-muted)]">Keine Treffer.</p>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Neue Firma">
          <CompanyForm
            key={createFormKey}
            compact
            submitLabel="Firma anlegen"
            onSubmit={async (body) => {
              const co = await createCompany(body);
              setCreateOpen(false);
              const list = await fetchCompanies();
              setRows(list);
              router.push(`/companies/${co.id}`);
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      </div>
    </main>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense
      fallback={
        <main className="p-4 md:p-8">
          <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
            <p className="text-sm text-[var(--fg-muted)]">Laden…</p>
          </div>
        </main>
      }
    >
      <CompaniesPageInner />
    </Suspense>
  );
}
