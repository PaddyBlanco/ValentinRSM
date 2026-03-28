"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Company, CompanyStatus, TimelineEntry } from "@/lib/api";
import { fetchCompanies, fetchTimeline, formatDateTime } from "@/lib/api";
import { mainNav } from "@/lib/nav";
import { useNavRefreshKey } from "@/components/layout/nav-refresh-context";
import { SettingsTrigger } from "../settings/settings-provider";
import { LogoMark } from "../branding/logo-mark";
import { TimelineEntryTypeIcon } from "../timeline/timeline-entry-type";

function Hairline() {
  return <div className="h-px w-full shrink-0 bg-[var(--hairline)]" />;
}

/** In der Sidebar nur sichtbare Status (kein Ruhend/Archiviert) */
const SIDEBAR_STATUS_ORDER: CompanyStatus[] = ["active", "inFocus"];

const statusSectionLabel: Record<CompanyStatus, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

export function NavSidebar() {
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus !== "loading";
  const navRefreshKey = useNavRefreshKey();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    (async () => {
      try {
        const [c, e] = await Promise.all([
          fetchCompanies(),
          fetchTimeline({ take: 5 }),
        ]);
        if (!cancelled) {
          setCompanies(c);
          setEvents(e);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "API nicht erreichbar");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navRefreshKey, sessionReady]);

  const companiesByStatus = SIDEBAR_STATUS_ORDER.map((status) => ({
    status,
    label: statusSectionLabel[status],
    items: companies
      .filter((c) => c.status === status)
      .sort((a, b) => a.name.localeCompare(b.name, "de")),
  })).filter((g) => g.items.length > 0);

  const companyNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of companies) m.set(c.id, c.name);
    return m;
  }, [companies]);

  const companyAccentById = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const c of companies) m.set(c.id, c.accentColor);
    return m;
  }, [companies]);

  return (
    <aside className="hidden h-[100dvh] max-h-[100dvh] min-h-0 w-[260px] shrink-0 flex-col overflow-hidden border-r border-[var(--hairline)] bg-[var(--bg)] md:sticky md:top-0 md:flex md:flex-col">
      <div className="shrink-0 border-b border-[var(--hairline)] px-4 py-5 text-[var(--fg)]">
        <span className="sr-only">ValentinRSM</span>
        <LogoMark className="h-8 w-auto max-w-full" />
      </div>

      <nav className="shrink-0 flex flex-col gap-0 px-2 py-3 text-sm" aria-label="Hauptnavigation">
        {mainNav.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-row items-center gap-3 rounded-sm px-3 py-2 transition hover:bg-[var(--hover)] ${
                active ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Hairline />

      <div className="shrink-0 px-3 py-3.5">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">Firmen</p>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <div className="space-y-3 text-sm">
          {companiesByStatus.length === 0 && !err ? (
            <p className="text-[var(--fg-muted)]">—</p>
          ) : (
            companiesByStatus.map((group) => (
              <div key={group.status}>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/companies/${c.id}`}
                        title={c.type}
                        className="group flex gap-2.5 rounded-sm py-0.5 pl-0.5 text-[var(--fg-muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                      >
                        {c.accentColor ? (
                          <span
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                            style={{ backgroundColor: c.accentColor }}
                          />
                        ) : (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-40" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{c.name}</span>
                          <span className="block max-h-0 overflow-hidden text-[10px] leading-snug text-[var(--fg-muted)] opacity-0 transition-[max-height,opacity,padding] duration-150 group-hover:max-h-8 group-hover:pt-0.5 group-hover:opacity-100">
                            {c.type}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      <Hairline />

      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
        <p className="mb-2 shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          Letzte 5 Ereignisse
        </p>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain text-xs">
          {events.length === 0 && !err ? (
            <li className="text-[var(--fg-muted)]">—</li>
          ) : (
            events.map((ev) => {
              const companyLabel = companyNameById.get(ev.companyId) ?? "—";
              const accent = companyAccentById.get(ev.companyId) ?? null;
              return (
                <li key={ev.id} className="border-b border-[var(--hairline)] px-0 pb-2 last:border-0">
                  <Link href={`/companies/${ev.companyId}`} className="block hover:text-[var(--fg)]">
                    <div className="flex gap-2.5">
                      <TimelineEntryTypeIcon
                        type={ev.type}
                        colorful
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[var(--fg-muted)]">{ev.title}</span>
                        <span className="mt-0.5 flex min-w-0 items-baseline gap-x-1 text-[10px] leading-snug text-[var(--fg-muted)] opacity-80">
                          <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
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
                            <span className="min-w-0 truncate" title={companyLabel}>
                              {companyLabel}
                            </span>
                          </span>
                          <span aria-hidden className="shrink-0">
                            ·
                          </span>
                          <time className="shrink-0 tabular-nums" dateTime={ev.occurredAt}>
                            {formatDateTime(ev.occurredAt)}
                          </time>
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
        <Link
          href="/events"
          className="mt-2 block shrink-0 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
        >
          Alle Ereignisse →
        </Link>
      </div>

      <div className="shrink-0 border-t border-[var(--hairline)] p-3">
        <SettingsTrigger variant="sidebar" />
      </div>
    </aside>
  );
}
