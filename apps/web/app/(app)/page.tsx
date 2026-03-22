"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  Company,
  CompanyRecentActivity,
  Contact,
  TimelineEntry,
  TimelineEntryType,
} from "@/lib/api";
import {
  fetchCompanies,
  fetchCompaniesRecentTimelineActivity,
  fetchContacts,
  fetchTimeline,
  formatDateTime,
} from "@/lib/api";
import {
  companyStatusLabel,
  companyStatusRank,
  companyStatusTagClass,
} from "@/lib/company-status";
import { formatRelativeActivityBrief } from "@/lib/format-relative-activity";
import { timelineContentNeedsExpand } from "@/lib/timeline-entry-content";
import { TimelineHtmlContent } from "@/components/timeline/timeline-html-content";
import { TimelineEntryTypeStamp } from "@/components/timeline/timeline-entry-type";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--hairline)]/80 bg-[color-mix(in_oklab,var(--bg-elevated)_32%,transparent)] backdrop-blur-sm">
      <div className="border-b border-[var(--hairline)]/80 px-4 py-3 bg-[color-mix(in_oklab,var(--bg-elevated)_22%,transparent)]">
        <h2 className="text-sm font-medium tracking-wide">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recentFocus, setRecentFocus] = useState<CompanyRecentActivity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [timelineExpanded, setTimelineExpanded] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [co, ct, ev, rf] = await Promise.all([
          fetchCompanies(),
          fetchContacts({ take: 5, sort: "recent" }),
          fetchTimeline({ take: 10 }),
          fetchCompaniesRecentTimelineActivity(5),
        ]);
        if (!c) {
          setCompanies(co);
          setContacts(ct);
          setEvents(ev);
          setRecentFocus(rf);
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

  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const recentFocusSorted = useMemo(() => {
    return [...recentFocus].sort((a, b) => {
      const byStatus = companyStatusRank(a.status) - companyStatusRank(b.status);
      if (byStatus !== 0) return byStatus;
      return new Date(b.lastTimelineAt).getTime() - new Date(a.lastTimelineAt).getTime();
    });
  }, [recentFocus]);

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
        {err && <p className="mb-4 text-sm text-red-500">{err}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Aktiv & im Blick">
          <ul className="space-y-2 text-sm">
            {recentFocusSorted.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 border-b border-[var(--hairline)] py-2 last:border-0"
              >
                <Link
                  href={`/companies/${c.id}`}
                  className="flex min-w-0 max-w-[min(100%,18rem)] items-start gap-2 hover:underline"
                >
                  {c.accentColor ? (
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                      style={{ backgroundColor: c.accentColor }}
                    />
                  ) : (
                    <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-30" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium leading-tight">{c.name}</span>
                    <span className="mt-0.5 block text-xs leading-tight text-[var(--fg-muted)] no-underline">
                      {c.type}
                    </span>
                  </span>
                </Link>
                <div className="ml-auto flex min-w-0 shrink-0 flex-col items-end gap-0.5 text-right text-xs text-[var(--fg-muted)]">
                  <span
                    className="text-[var(--fg)]"
                    title={`Letzte Timeline-Aktivität: ${formatDateTime(c.lastTimelineAt)}`}
                  >
                    {formatRelativeActivityBrief(c.lastTimelineAt)}
                  </span>
                  <span className={companyStatusTagClass(c.status)}>{companyStatusLabel[c.status]}</span>
                </div>
              </li>
            ))}
            {recentFocusSorted.length === 0 && (
              <li className="text-[var(--fg-muted)]">
                Keine Timeline-Einträge bei Firmen mit Status „Aktiv“ oder „Im Blick“.
              </li>
            )}
          </ul>
          <Link href="/companies" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Alle Firmen →
          </Link>
        </Panel>

        <Panel title="Letzte Kontakte">
          <ul className="space-y-3 text-sm">
            {contacts.map((k) => {
              const co = companyById.get(k.companyId);
              return (
                <li key={k.id} className="border-b border-[var(--hairline)] pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
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
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                      <time
                        className="text-xs tabular-nums text-[var(--fg-muted)]"
                        dateTime={k.createdAt}
                      >
                        {formatDateTime(k.createdAt)}
                      </time>
                      {k.lastTimelineAt ? (
                        <span
                          className="max-w-[11rem] text-[10px] leading-tight text-[var(--fg-muted)]"
                          title={`Letztes Ereignis mit Kontakt: ${formatDateTime(k.lastTimelineAt)}`}
                        >
                          {formatRelativeActivityBrief(k.lastTimelineAt)}
                        </span>
                      ) : (
                        <span
                          className="text-[10px] text-[var(--fg-muted)]"
                          title="Kein Timeline-Ereignis mit diesem Kontakt"
                        >
                          Kein Ereignis
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {contacts.length === 0 && <li className="text-[var(--fg-muted)]">Keine Kontakte.</li>}
          </ul>
          <Link href="/contacts" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Alle Kontakte →
          </Link>
        </Panel>

        <div className="lg:col-span-2">
          <Panel title="Letzte 10 Ereignisse">
            <ul className="w-full space-y-4">
              {events.map((ev) => {
                const co = companyById.get(ev.companyId);
                const contentLong = ev.content ? timelineContentNeedsExpand(ev.content) : false;
                const contentExpanded = !!timelineExpanded[ev.id];
                return (
                  <li key={ev.id}>
                    <article className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--bg-elevated)] shadow-sm">
                      <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                        <TimelineEntryTypeStamp type={ev.type as TimelineEntryType} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold leading-snug text-[var(--fg)]">{ev.title}</h3>
                          <p className="mt-1 text-xs text-[var(--fg-muted)]">
                            {co ? (
                              <Link
                                href={`/companies/${ev.companyId}`}
                                className="inline-flex max-w-full min-w-0 items-center gap-1.5 hover:text-[var(--fg)] hover:underline"
                              >
                                {co.accentColor ? (
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                                    style={{ backgroundColor: co.accentColor }}
                                    aria-hidden
                                  />
                                ) : (
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-40"
                                    aria-hidden
                                  />
                                )}
                                <span className="truncate">{co.name}</span>
                              </Link>
                            ) : (
                              <span>—</span>
                            )}
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
                          {ev.content && (
                            <div className="mt-3">
                              <div
                                className={
                                  contentLong && !contentExpanded ? "line-clamp-6 overflow-hidden" : ""
                                }
                              >
                                <TimelineHtmlContent content={ev.content} />
                              </div>
                              {contentLong && (
                                <button
                                  type="button"
                                  className="mt-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                                  aria-expanded={contentExpanded}
                                  onClick={() =>
                                    setTimelineExpanded((prev) => ({
                                      ...prev,
                                      [ev.id]: !prev[ev.id],
                                    }))
                                  }
                                >
                                  {contentExpanded ? "Weniger" : "Mehr anzeigen"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
              {events.length === 0 && (
                <li className="rounded-2xl border border-dashed border-[var(--hairline)] py-12 text-center text-sm text-[var(--fg-muted)]">
                  Keine Ereignisse.
                </li>
              )}
            </ul>
            <Link href="/events" className="mt-4 inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
              Alle Ereignisse →
            </Link>
          </Panel>
        </div>
      </div>
      </div>
    </main>
  );
}
