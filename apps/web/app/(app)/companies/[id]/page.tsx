"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Company, Contact, TimelineEntry } from "@/lib/api";
import { fetchCompany, fetchContacts, fetchTimeline, formatDateTime } from "@/lib/api";

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        const [co, ct, tl] = await Promise.all([
          fetchCompany(id),
          fetchContacts({ companyId: id }),
          fetchTimeline({ companyId: id, take: 50 }),
        ]);
        if (!c) {
          setCompany(co);
          setContacts(ct);
          setTimeline(tl);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!c) setErr(e instanceof Error ? e.message : "Nicht gefunden");
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  if (err || !company) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-sm text-[var(--fg-muted)]">{err ?? "Laden…"}</p>
        <Link href="/companies" className="mt-4 inline-block text-sm hover:underline">
          ← Zurück
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-wrap items-start gap-3">
          {company.accentColor && (
            <span
              className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)]"
              style={{ backgroundColor: company.accentColor }}
            />
          )}
          <div>
            <h1 className="text-xl font-medium">{company.name}</h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              {company.type} · {company.status}
            </p>
          </div>
        </div>
        {company.notes && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">{company.notes}</p>
        )}
      </header>

      <section className="mb-10">
        <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">Kontakte</h2>
        <ul className="space-y-2 text-sm">
          {contacts.map((k) => (
            <li key={k.id} className="flex border-b border-[var(--hairline)] py-2 last:border-0">
              <Link href={`/contacts/${k.id}`} className="hover:underline">
                {k.firstName} {k.lastName}
              </Link>
              {k.email && <span className="ml-3 text-[var(--fg-muted)]">{k.email}</span>}
            </li>
          ))}
          {contacts.length === 0 && <li className="text-[var(--fg-muted)]">Keine Kontakte.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">Timeline</h2>
        <ul className="space-y-4 text-sm">
          {timeline.map((ev) => (
            <li key={ev.id} className="border-b border-[var(--hairline)] pb-4 last:border-0">
              <div className="font-medium">{ev.title}</div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">
                {formatDateTime(ev.occurredAt)} · {ev.type} · {ev.source}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[var(--fg-muted)]">{ev.content}</p>
            </li>
          ))}
          {timeline.length === 0 && <li className="text-[var(--fg-muted)]">Keine Einträge.</li>}
        </ul>
      </section>
    </main>
  );
}
