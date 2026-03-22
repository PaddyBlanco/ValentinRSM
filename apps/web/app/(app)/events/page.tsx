"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TimelineEntry } from "@/lib/api";
import { TimelineEntryTypeBadge } from "@/components/timeline-entry-type";
import { fetchTimeline, formatDateTime } from "@/lib/api";

export default function EventsPage() {
  const [rows, setRows] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const data = await fetchTimeline({ take: 200 });
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
        <h1 className="text-xl font-medium">Letzte Ereignisse</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Chronologisch über alle Firmen und Kontakte (bis zu 200 Einträge).
        </p>
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      </header>

      <ul className="space-y-0 border border-[var(--hairline)]">
        {rows.map((ev) => (
          <li
            key={ev.id}
            id={ev.id}
            className="border-b border-[var(--hairline)] px-4 py-4 last:border-0"
          >
            <div className="font-medium">{ev.title}</div>
            <div className="mt-1 text-xs text-[var(--fg-muted)]">
              <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>{formatDateTime(ev.occurredAt)}</span>
                <span aria-hidden>·</span>
                <TimelineEntryTypeBadge type={ev.type} />
                <span aria-hidden>·</span>
                <span>{ev.source}</span>
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-[var(--fg-muted)]">{ev.content}</p>
            <div className="mt-3 flex gap-4 text-xs">
              <Link href={`/companies/${ev.companyId}`} className="hover:underline">
                Firma
              </Link>
              <Link href={`/contacts/${ev.contactId}`} className="hover:underline">
                Kontakt
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 && !err && (
        <p className="mt-6 text-sm text-[var(--fg-muted)]">Keine Ereignisse.</p>
      )}
    </main>
  );
}
