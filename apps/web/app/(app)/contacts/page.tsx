"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ContactForm } from "@/components/contacts/contact-form";
import { MailtoLink, TelLink } from "@/components/contacts/contact-links";
import { Modal } from "@/components/ui/modal";
import type { Company, Contact } from "@/lib/api";
import { createContact, fetchCompanies, fetchContacts } from "@/lib/api";

function ContactsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus !== "loading";
  const [rows, setRows] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [defaultCompanyId, setDefaultCompanyId] = useState("");
  const [lockCompany, setLockCompany] = useState(false);

  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  useEffect(() => {
    if (!sessionReady) return;
    let c = false;
    (async () => {
      try {
        const [data, co] = await Promise.all([fetchContacts(), fetchCompanies()]);
        if (!c) {
          setRows(data);
          setCompanies(co);
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
      : rows.filter((k) => {
          const co = companyById.get(k.companyId);
          const companyName = co?.name?.toLowerCase() ?? "";
          return (
            `${k.firstName} ${k.lastName}`.toLowerCase().includes(q) ||
            (k.email?.toLowerCase()?.includes(q) ?? false) ||
            (k.phone?.toLowerCase()?.includes(q) ?? false) ||
            companyName.includes(q) ||
            (k.roleTitle?.toLowerCase()?.includes(q) ?? false)
          );
        });
    return [...list].sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName, "de", { sensitivity: "base" });
      if (ln !== 0) return ln;
      return a.firstName.localeCompare(b.firstName, "de", { sensitivity: "base" });
    });
  }, [rows, query, companyById]);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    const cid = searchParams.get("companyId")?.trim() ?? "";
    setDefaultCompanyId(cid);
    setLockCompany(!!cid);
    setCreateOpen(true);
    setCreateFormKey((k) => k + 1);
    router.replace("/contacts", { scroll: false });
  }, [searchParams, router]);

  const companyOpts = companies.map((x) => ({ id: x.id, name: x.name }));

  return (
    <main className="p-4 md:p-8">
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-3">
          <h1 className="text-lg font-medium">Kontakte</h1>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--hairline)]"
            onClick={() => {
              setDefaultCompanyId("");
              setLockCompany(false);
              setCreateFormKey((k) => k + 1);
              setCreateOpen(true);
            }}
          >
            Neu
          </button>
        </header>

        {err && <p className="mb-2 text-xs text-red-500">{err}</p>}

        <div className="mb-2">
          <label htmlFor="contact-search" className="sr-only">
            Kontakte durchsuchen
          </label>
          <input
            id="contact-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            autoComplete="off"
            className="w-full max-w-md rounded border border-[var(--hairline)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--fg-muted)]"
          />
        </div>

        <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {filtered.map((k) => {
            const co = companyById.get(k.companyId);
            return (
              <li key={k.id}>
                <div className="grid grid-cols-1 gap-y-2 py-1.5 pr-1 text-sm hover:bg-[var(--hover)] md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-4 md:gap-y-0">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <Link href={`/contacts/${k.id}`} className="shrink-0 font-medium hover:underline">
                        {k.firstName} {k.lastName}
                      </Link>
                      {k.roleTitle?.trim() && (
                        <span className="text-xs text-[var(--fg-muted)]">{k.roleTitle.trim()}</span>
                      )}
                    </div>
                    <Link
                      href={`/companies/${k.companyId}`}
                      className="mt-0.5 flex max-w-full min-w-0 items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
                    >
                      {co?.accentColor ? (
                        <span
                          className="h-2 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                          style={{ backgroundColor: co.accentColor }}
                          aria-hidden
                        />
                      ) : (
                        <span
                          className="h-2 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-40"
                          aria-hidden
                        />
                      )}
                      <span className="truncate">{co?.name ?? "Firma"}</span>
                    </Link>
                  </div>
                  <div className="hidden min-w-0 flex-col items-center justify-center gap-0.5 text-center text-xs text-[var(--fg-muted)] md:flex">
                    <div className="min-w-0 max-w-full truncate">
                      {k.email ? (
                        <MailtoLink email={k.email} className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline" />
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="min-w-0 max-w-full truncate">
                      {k.phone ? (
                        <TelLink phone={k.phone} className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline" />
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden min-w-0 md:block" aria-hidden />
                </div>
              </li>
            );
          })}
        </ul>

        {rows.length === 0 && !err && (
          <p className="mt-3 text-xs text-[var(--fg-muted)]">Keine Kontakte.</p>
        )}
        {rows.length > 0 && filtered.length === 0 && (
          <p className="mt-3 text-xs text-[var(--fg-muted)]">Keine Treffer.</p>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Neuer Kontakt" wide>
          {companies.length === 0 && !err ? (
            <p className="text-sm text-[var(--fg-muted)]">Firmen werden geladen…</p>
          ) : (
            <ContactForm
              key={createFormKey}
              compact
              defaultCompanyId={defaultCompanyId}
              companies={companyOpts}
              lockCompany={lockCompany}
              submitLabel="Kontakt anlegen"
              onSubmit={async (body) => {
                const k = await createContact(body);
                setCreateOpen(false);
                const [data, co] = await Promise.all([fetchContacts(), fetchCompanies()]);
                setRows(data);
                setCompanies(co);
                router.push(`/contacts/${k.id}`);
              }}
              onCancel={() => setCreateOpen(false)}
            />
          )}
        </Modal>
      </div>
    </main>
  );
}

export default function ContactsPage() {
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
      <ContactsPageInner />
    </Suspense>
  );
}
