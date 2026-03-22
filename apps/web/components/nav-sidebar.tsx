"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Company, TimelineEntry } from "@/lib/api";
import { fetchCompanies, fetchTimeline, formatDateTime } from "@/lib/api";
import { mainNav } from "@/lib/nav";
import { SettingsTrigger } from "./settings-provider";
import { LogoMark } from "./logo-mark";

function Hairline() {
  return <div className="h-px w-full bg-[var(--hairline)]" />;
}

export function NavSidebar() {
  const pathname = usePathname();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const activeCompanies = companies.filter((c) => c.status === "active");

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--bg)] md:flex">
      <div className="border-b border-[var(--hairline)] px-4 py-5 text-[var(--fg)]">
        <span className="sr-only">ValentinRSM</span>
        <LogoMark className="h-8 w-auto max-w-full" />
      </div>

      <nav className="flex flex-col gap-0 px-2 py-3 text-sm" aria-label="Hauptnavigation">
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

      <div className="px-3 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          Aktive Firmen
        </p>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
          {activeCompanies.length === 0 && !err ? (
            <li className="text-[var(--fg-muted)]">—</li>
          ) : (
            activeCompanies.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/companies/${c.id}`}
                  className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  {c.accentColor ? (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full border border-[var(--hairline)]"
                      style={{ backgroundColor: c.accentColor }}
                    />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-40" />
                  )}
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <Hairline />

      <div className="flex flex-1 flex-col px-3 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          Letzte 5 Ereignisse
        </p>
        <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
          {events.length === 0 && !err ? (
            <li className="text-[var(--fg-muted)]">—</li>
          ) : (
            events.map((ev) => (
              <li key={ev.id} className="border-b border-[var(--hairline)] px-0 pb-2 last:border-0">
                <Link href={`/events#${ev.id}`} className="block hover:text-[var(--fg)]">
                  <span className="line-clamp-2 text-[var(--fg-muted)]">{ev.title}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--fg-muted)] opacity-80">
                    {formatDateTime(ev.occurredAt)}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-auto border-t border-[var(--hairline)] p-3">
        <SettingsTrigger variant="sidebar" />
      </div>
    </aside>
  );
}
