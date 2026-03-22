"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Company, Contact, TimelineEntry } from "@/lib/api";
import { fetchCompanies, fetchContacts, fetchTimeline, formatDateTime } from "@/lib/api";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--hairline)] bg-[var(--bg-elevated)]">
      <div className="border-b border-[var(--hairline)] px-4 py-3">
        <h2 className="text-sm font-medium tracking-wide">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [co, ct, ev] = await Promise.all([
          fetchCompanies(),
          fetchContacts({ take: 8, sort: "recent" }),
          fetchTimeline({ take: 12 }),
        ]);
        if (!c) {
          setCompanies(co);
          setContacts(ct);
          setEvents(ev);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!c) setErr(e instanceof Error ? e.message : "Fehler beim Laden");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const active = companies.filter((x) => x.status === "active");

  return (
    <main className="p-6 md:p-10">
      <header className="mb-10 border-b border-[var(--hairline)] pb-6">
        <h1 className="text-xl font-medium tracking-tight md:text-2xl">Überblick</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">
          Aktive Firmen, letzte Kontakte und Ereignisse auf einen Blick.
        </p>
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Aktive Firmen">
          <p className="mb-4 text-3xl font-light tabular-nums">{active.length}</p>
          <ul className="space-y-2 text-sm">
            {active.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-[var(--hairline)] py-2 last:border-0">
                <Link href={`/companies/${c.id}`} className="flex items-center gap-2 hover:underline">
                  {c.accentColor ? (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                      style={{ backgroundColor: c.accentColor }}
                    />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-30" />
                  )}
                  <span>{c.name}</span>
                </Link>
                <span className="text-xs text-[var(--fg-muted)]">{c.type}</span>
              </li>
            ))}
            {active.length === 0 && <li className="text-[var(--fg-muted)]">Keine aktiven Firmen.</li>}
          </ul>
          <Link href="/companies" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Alle Firmen →
          </Link>
        </Panel>

        <Panel title="Letzte Kontakte">
          <ul className="space-y-2 text-sm">
            {contacts.map((k) => (
              <li key={k.id} className="border-b border-[var(--hairline)] py-2 last:border-0">
                <Link href={`/contacts/${k.id}`} className="hover:underline">
                  {k.firstName} {k.lastName}
                </Link>
                <div className="text-xs text-[var(--fg-muted)]">
                  {formatDateTime(k.createdAt)} ·{" "}
                  <Link href={`/companies/${k.companyId}`} className="hover:text-[var(--fg)]">
                    Firma
                  </Link>
                </div>
              </li>
            ))}
            {contacts.length === 0 && <li className="text-[var(--fg-muted)]">Keine Kontakte.</li>}
          </ul>
          <Link href="/contacts" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Alle Kontakte →
          </Link>
        </Panel>

        <Panel title="Letzte Aktivitäten">
          <ul className="space-y-3 text-sm">
            {events.slice(0, 8).map((ev) => (
              <li key={ev.id} className="border-b border-[var(--hairline)] pb-3 last:border-0">
                <div className="line-clamp-2">{ev.title}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[var(--fg-muted)]">
                  <span>{formatDateTime(ev.occurredAt)}</span>
                  <Link href={`/companies/${ev.companyId}`} className="hover:text-[var(--fg)]">
                    Firma
                  </Link>
                  {ev.contactId && ev.contactName && (
                    <Link href={`/contacts/${ev.contactId}`} className="hover:text-[var(--fg)]">
                      {ev.contactName}
                    </Link>
                  )}
                </div>
              </li>
            ))}
            {events.length === 0 && <li className="text-[var(--fg-muted)]">Keine Ereignisse.</li>}
          </ul>
          <Link href="/events" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Alle Ereignisse →
          </Link>
        </Panel>

        <Panel title="Alle Firmen (Kurz)">
          <p className="text-sm text-[var(--fg-muted)]">
            Gesamt <span className="font-medium text-[var(--fg)]">{companies.length}</span> Firmen
            registriert.
          </p>
          <Link
            href="/companies"
            className="mt-4 inline-block border border-[var(--hairline)] px-4 py-2 text-sm hover:bg-[var(--hover)]"
          >
            Zur Firmenliste
          </Link>
        </Panel>
      </div>
    </main>
  );
}
