"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Company, Contact, TimelineEntry } from "@/lib/api";
import { fetchCompany, fetchContact, fetchTimeline, formatDateTime } from "@/lib/api";

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        const k = await fetchContact(id);
        if (c) return;
        setContact(k);
        const [co, tl] = await Promise.all([
          fetchCompany(k.companyId),
          fetchTimeline({ contactId: id, take: 50 }),
        ]);
        if (!c) {
          setCompany(co);
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

  if (err || !contact) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-sm text-[var(--fg-muted)]">{err ?? "Laden…"}</p>
        <Link href="/contacts" className="mt-4 inline-block text-sm hover:underline">
          ← Zurück
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <h1 className="text-xl font-medium">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          {company && (
            <Link href={`/companies/${company.id}`} className="hover:underline">
              {company.name}
            </Link>
          )}
        </p>
        <dl className="mt-4 grid gap-2 text-sm">
          {contact.email && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">E-Mail</dt>
              <dd>{contact.email}</dd>
            </div>
          )}
          {contact.phone && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">Telefon</dt>
              <dd>{contact.phone}</dd>
            </div>
          )}
          {contact.roleTitle && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">Rolle</dt>
              <dd>{contact.roleTitle}</dd>
            </div>
          )}
        </dl>
        {contact.notes && (
          <p className="mt-4 text-sm text-[var(--fg-muted)]">{contact.notes}</p>
        )}
      </header>

      <section>
        <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">Timeline</h2>
        <ul className="space-y-4 text-sm">
          {timeline.map((ev) => (
            <li key={ev.id} className="border-b border-[var(--hairline)] pb-4 last:border-0">
              <div className="font-medium">{ev.title}</div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">
                {formatDateTime(ev.occurredAt)} · {ev.type}
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
