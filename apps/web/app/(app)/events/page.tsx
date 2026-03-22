"use client";

import Link from "next/link";
import { TimelineHtmlContent } from "@/components/timeline/timeline-html-content";
import { TimelineEntryTypeStamp } from "@/components/timeline/timeline-entry-type";
import { TimelineLoadSentinel } from "@/components/timeline/timeline-load-sentinel";
import { useInfiniteTimeline } from "@/lib/use-infinite-timeline";
import { formatDateTime } from "@/lib/api";

export default function EventsPage() {
  const {
    items: rows,
    loading,
    loadingMore,
    hasMore,
    err,
    loadMore,
  } = useInfiniteTimeline({});

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <h1 className="text-xl font-medium">Letzte Ereignisse</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Chronologisch über alle Firmen und Kontakte. Es werden jeweils 10 Einträge geladen; beim Scrollen
          nach unten werden weitere nachgeladen.
        </p>
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      </header>

      {loading && <p className="mb-4 text-sm text-[var(--fg-muted)]">Laden…</p>}

      <ul className="space-y-0 border border-[var(--hairline)]">
        {rows.map((ev) => (
          <li
            key={ev.id}
            id={ev.id}
            className="border-b border-[var(--hairline)] px-4 py-4 last:border-0"
          >
            <div className="flex gap-3 sm:gap-4">
              <TimelineEntryTypeStamp type={ev.type} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{ev.title}</div>
                <div className="mt-1 text-xs text-[var(--fg-muted)]">
                  <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span>{formatDateTime(ev.occurredAt)}</span>
                    <span aria-hidden>·</span>
                    <span>{ev.source}</span>
                  </span>
                </div>
                {!!ev.content?.trim() && (
                  <div className="mt-2 line-clamp-3 overflow-hidden text-sm">
                    <TimelineHtmlContent content={ev.content} />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <Link href={`/companies/${ev.companyId}`} className="hover:underline">
                    Firma
                  </Link>
                  {ev.contactId && ev.contactName && (
                    <Link href={`/contacts/${ev.contactId}`} className="hover:underline">
                      {ev.contactName}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!loading && hasMore && (
        <TimelineLoadSentinel onLoadMore={loadMore} hasMore={hasMore} loadingInitial={loading} />
      )}
      {loadingMore && (
        <p className="mt-4 text-center text-xs text-[var(--fg-muted)]">Weitere Einträge werden geladen…</p>
      )}

      {!loading && rows.length === 0 && !err && (
        <p className="mt-6 text-sm text-[var(--fg-muted)]">Keine Ereignisse.</p>
      )}
    </main>
  );
}
