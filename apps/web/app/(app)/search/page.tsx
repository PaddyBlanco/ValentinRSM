"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MailtoLink, TelLink } from "@/components/contacts/contact-links";
import { TimelineEntryTypeStamp } from "@/components/timeline/timeline-entry-type";
import type { SearchResponse, TimelineEntryType } from "@/lib/api";
import {
  fetchSearch,
  formatDateTime,
  pickSearchCompanyAccentColor,
  pickSearchHitAccentColor,
} from "@/lib/api";
import { companyStatusLabel, companyStatusTagClass } from "@/lib/company-status";

const SEARCH_PAGE_SIZE = 5;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus !== "loading";
  const qParam = (searchParams.get("q") ?? "").trim();
  const [input, setInput] = useState(qParam);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCompanies, setShowCompanies] = useState(SEARCH_PAGE_SIZE);
  const [showContacts, setShowContacts] = useState(SEARCH_PAGE_SIZE);
  const [showEvents, setShowEvents] = useState(SEARCH_PAGE_SIZE);

  useEffect(() => {
    setInput(qParam);
  }, [qParam]);

  useEffect(() => {
    if (qParam.length < 2) {
      setData(null);
      setErr(null);
      return;
    }
    if (!sessionReady) return;
    let c = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchSearch(qParam, 80);
        if (!c) {
          setData(res);
          setShowCompanies(SEARCH_PAGE_SIZE);
          setShowContacts(SEARCH_PAGE_SIZE);
          setShowEvents(SEARCH_PAGE_SIZE);
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
  }, [qParam, sessionReady]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
  }

  const emptyQuery = qParam.length < 2;

  return (
    <main className="p-4 md:p-8">
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
        <header className="mb-3 border-b border-[var(--hairline)] pb-3">
          <h1 className="text-lg font-medium">Suche</h1>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Firmen, Kontakte und Timeline (mindestens 2 Zeichen).
          </p>
          <form onSubmit={onSubmit} className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
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
              className="min-h-9 flex-1 rounded border border-[var(--hairline)] bg-[var(--bg)] px-2 py-1.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--fg-muted)]"
              autoComplete="off"
            />
            <button
              type="submit"
              className="min-h-9 shrink-0 rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-3 text-xs font-medium text-[var(--fg)] hover:bg-[var(--hairline)]"
            >
              Suchen
            </button>
          </form>
          {err && <p className="mt-3 text-xs text-red-500">{err}</p>}
        </header>

        {loading && <p className="text-sm text-[var(--fg-muted)]">Laden…</p>}

        {emptyQuery && !loading && (
          <p className="text-xs text-[var(--fg-muted)]">Bitte mindestens 2 Zeichen eingeben.</p>
        )}

        {!emptyQuery && !loading && data && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-2 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
                Firmen ({data.companies.length})
              </h2>
              {data.companies.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)]">Keine Treffer.</p>
              ) : (
                <>
                <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                  {data.companies.slice(0, showCompanies).map((c) => {
                    const accent = pickSearchHitAccentColor(c);
                    return (
                    <li key={c.id}>
                      <Link
                        href={`/companies/${c.id}`}
                        className="flex items-start justify-between gap-3 py-1.5 pr-1 text-sm hover:bg-[var(--hover)]"
                      >
                        <span className="flex min-w-0 flex-1 items-start gap-2">
                          {accent ? (
                            <span
                              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                              style={{ backgroundColor: accent }}
                              aria-hidden
                            />
                          ) : (
                            <span
                              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-30"
                              aria-hidden
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-medium leading-tight">{c.name}</span>
                            <span className="mt-0.5 block text-xs leading-tight text-[var(--fg-muted)]">{c.type}</span>
                          </span>
                        </span>
                        <span className={`shrink-0 self-start ${companyStatusTagClass(c.status)}`}>
                          {companyStatusLabel[c.status]}
                        </span>
                      </Link>
                    </li>
                  );
                  })}
                </ul>
                {data.companies.length > showCompanies && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                    onClick={() =>
                      setShowCompanies((n) =>
                        Math.min(n + SEARCH_PAGE_SIZE, data.companies.length),
                      )
                    }
                  >
                    Mehr anzeigen
                  </button>
                )}
                </>
              )}
            </section>

            <section>
              <h2 className="mb-2 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
                Kontakte ({data.contacts.length})
              </h2>
              {data.contacts.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)]">Keine Treffer.</p>
              ) : (
                <>
                <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                  {data.contacts.slice(0, showContacts).map((k) => {
                    const accent = pickSearchCompanyAccentColor(k);
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
                            {accent ? (
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                                style={{ backgroundColor: accent }}
                                aria-hidden
                              />
                            ) : (
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-40"
                                aria-hidden
                              />
                            )}
                            <span className="truncate">{k.companyName}</span>
                          </Link>
                        </div>
                        <div className="hidden min-w-0 flex-col items-center justify-center gap-0.5 text-center text-xs text-[var(--fg-muted)] md:flex">
                          <div className="min-w-0 max-w-full truncate">
                            {k.email ? (
                              <MailtoLink
                                email={k.email}
                                className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                              />
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-full truncate">
                            {k.phone ? (
                              <TelLink
                                phone={k.phone}
                                className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                              />
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
                {data.contacts.length > showContacts && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                    onClick={() =>
                      setShowContacts((n) =>
                        Math.min(n + SEARCH_PAGE_SIZE, data.contacts.length),
                      )
                    }
                  >
                    Mehr anzeigen
                  </button>
                )}
                </>
              )}
            </section>

            <section>
              <h2 className="mb-2 border-b border-[var(--hairline)] pb-2 text-sm font-medium">
                Ereignisse ({data.timelineEntries.length})
              </h2>
              {data.timelineEntries.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)]">Keine Treffer.</p>
              ) : (
                <>
                <ul className="w-full space-y-4">
                  {data.timelineEntries.slice(0, showEvents).map((ev) => {
                    const accent = pickSearchCompanyAccentColor(ev);
                    return (
                    <li key={ev.id}>
                      <article className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--bg-elevated)] shadow-sm">
                        <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                          <TimelineEntryTypeStamp type={ev.type as TimelineEntryType} />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold leading-snug text-[var(--fg)]">{ev.title}</h3>
                            <p className="mt-1 text-xs text-[var(--fg-muted)]">
                              <Link
                                href={`/companies/${ev.companyId}`}
                                className="inline-flex max-w-full min-w-0 items-center gap-1.5 hover:text-[var(--fg)] hover:underline"
                              >
                                {accent ? (
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                                    style={{ backgroundColor: accent }}
                                    aria-hidden
                                  />
                                ) : (
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-40"
                                    aria-hidden
                                  />
                                )}
                                <span className="truncate">{ev.companyName}</span>
                              </Link>
                              <span aria-hidden className="mx-1.5">
                                ·
                              </span>
                              {formatDateTime(ev.occurredAt)}
                              <span aria-hidden className="mx-1.5">
                                ·
                              </span>
                              {ev.source}
                              {ev.contactId && ev.contactName && (
                                <>
                                  <span aria-hidden className="mx-1.5">
                                    ·
                                  </span>
                                  <Link
                                    href={`/contacts/${ev.contactId}`}
                                    className="hover:text-[var(--fg)] hover:underline"
                                  >
                                    {ev.contactName}
                                  </Link>
                                </>
                              )}
                            </p>
                            {ev.contentPreview && (
                              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm text-[var(--fg-muted)]">
                                {ev.contentPreview}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                  })}
                </ul>
                {data.timelineEntries.length > showEvents && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                    onClick={() =>
                      setShowEvents((n) =>
                        Math.min(n + SEARCH_PAGE_SIZE, data.timelineEntries.length),
                      )
                    }
                  >
                    Mehr anzeigen
                  </button>
                )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
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
      <SearchContent />
    </Suspense>
  );
}
