"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/nav";

/** Feste Leiste unten: Start, Firmen, Kontakte, Ereignisse (nur unter md). */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--hairline)] bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      aria-label="Hauptnavigation"
    >
      <ul className="flex h-14 w-full flex-row items-stretch justify-around">
        {mainNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
                  active ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{item.mobileLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
