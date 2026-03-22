"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ContactForm } from "@/components/contacts/contact-form";
import { MailtoLink, TelLink } from "@/components/contacts/contact-links";
import { Modal } from "@/components/ui/modal";
import type { Company, Contact } from "@/lib/api";
import { createContact, fetchCompanies, fetchContacts } from "@/lib/api";

function ContactsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [defaultCompanyId, setDefaultCompanyId] = useState("");
  const [lockCompany, setLockCompany] = useState(false);

  useEffect(() => {
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
  }, []);

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
    <main className="p-6 md:p-10">
      <header className="mb-8 flex flex-col gap-4 border-b border-[var(--hairline)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-medium">Kontakte</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">Alle Kontakte alphabetisch.</p>
          {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        </div>
        <button
          type="button"
          className="inline-flex w-fit items-center rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-4 py-2 text-sm font-medium hover:bg-[var(--hairline)]"
          onClick={() => {
            setDefaultCompanyId("");
            setLockCompany(false);
            setCreateFormKey((k) => k + 1);
            setCreateOpen(true);
          }}
        >
          Neuer Kontakt
        </button>
      </header>

      <div className="overflow-x-auto border border-[var(--hairline)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] text-xs uppercase tracking-wide text-[var(--fg-muted)]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
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
                <td className="px-4 py-3 text-[var(--fg-muted)]">
                  {r.email ? <MailtoLink email={r.email} /> : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">
                  {r.phone ? <TelLink phone={r.phone} /> : "—"}
                </td>
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
    </main>
  );
}

export default function ContactsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 md:p-10">
          <p className="text-sm text-[var(--fg-muted)]">Laden…</p>
        </main>
      }
    >
      <ContactsPageInner />
    </Suspense>
  );
}
