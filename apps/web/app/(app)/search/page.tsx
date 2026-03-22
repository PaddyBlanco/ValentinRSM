"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MailtoLink } from "@/components/contact-links";
import type { SearchResponse } from "@/lib/api";
import { TimelineEntryTypeBadge } from "@/components/timeline-entry-type";
import { fetchSearch, formatDateTime } from "@/lib/api";

const statusLabel: Record<string, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = (searchParams.get("q") ?? "").trim();
  const [input, setInput] = useState(qParam);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(qParam);
  }, [qParam]);

  useEffect(() => {
    if (qParam.length < 2) {
      setData(null);
      setErr(null);
      return;
    }
    let c = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchSearch(qParam, 30);
        if (!c) {
          setData(res);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!c) setErr(e instanceof Error ? e.message : "Fehler");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [qParam]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
  }

  const emptyQuery = qParam.length < 2;

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <h1 className="text-xl font-medium">Suche</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Firmen, Kontakte und Timeline (Stichwort, mindestens 2 Zeichen).
        </p>
        <form onSubmit={onSubmit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="search-q">
            Suchbegriff
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="z. B. Bank, E-Mail, Meeting…"
            className="min-h-11 flex-1 rounded-sm border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--fg-muted)]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-4 text-sm font-medium text-[var(--fg)] hover:bg-[var(--hairline)]"
          >
            Suchen
          </button>
        </form>
        {err && <p className="mt-4 text-sm text-red-500">{err}</p>}
      </header>

      {loading && <p className="text-sm text-[var(--fg-muted)]">Laden…</p>}

      {emptyQuery && !loading && (
        <p className="text-sm text-[var(--fg-muted)]">Bitte einen Suchbegriff mit mindestens 2 Zeichen eingeben.</p>
      )}

      {!emptyQuery && !loading && data && (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
              Firmen ({data.companies.length})
            </h2>
            {data.companies.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">Keine Treffer.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.companies.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0">
                    {c.accentColor && (
                      <span
                        className="h-3 w-3 shrink-0 rounded border border-[var(--hairline)]"
                        style={{ backgroundColor: c.accentColor }}
                      />
                    )}
                    <Link href={`/companies/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    <span className="text-[var(--fg-muted)]">
                      {c.type} · {statusLabel[c.status] ?? c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
              Kontakte ({data.contacts.length})
            </h2>
            {data.contacts.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">Keine Treffer.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.contacts.map((k) => (
                  <li key={k.id} className="border-b border-[var(--hairline)] py-2 last:border-0">
                    <Link href={`/contacts/${k.id}`} className="font-medium hover:underline">
                      {k.firstName} {k.lastName}
                    </Link>
                    <div className="mt-0.5 text-[var(--fg-muted)]">
                      {k.companyName}
                      {k.email && (
                        <span className="ml-2">
                          <MailtoLink email={k.email} />
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
              Timeline ({data.timelineEntries.length})
            </h2>
            {data.timelineEntries.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">Keine Treffer.</p>
            ) : (
              <ul className="space-y-4 text-sm">
                {data.timelineEntries.map((ev) => (
                  <li key={ev.id} className="border-b border-[var(--hairline)] pb-4 last:border-0">
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
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-[var(--fg-muted)]">{ev.contentPreview}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className="text-[var(--fg-muted)]">{ev.companyName}</span>
                      <Link href={`/companies/${ev.companyId}`} className="hover:underline">
                        Firma
                      </Link>
                      <Link href={`/contacts/${ev.contactId}`} className="hover:underline">
                        {ev.contactName}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 md:p-10">
          <p className="text-sm text-[var(--fg-muted)]">Laden…</p>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
