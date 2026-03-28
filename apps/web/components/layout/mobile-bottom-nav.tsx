"use client";

import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mainNav } from "@/lib/nav";
import { useSettings } from "../settings/settings-provider";

/** Feste Leiste unten: Start, Firmen, Kontakte, Ereignisse, Einstellungen (nur unter md). */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { setOpen: openSettings } = useSettings();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  const nav = (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] box-border w-full max-w-[100vw] border-t border-[var(--hairline)] bg-[var(--bg)] pb-[max(env(safe-area-inset-bottom),0px)] md:hidden"
      aria-label="Hauptnavigation und Einstellungen"
    >
      <ul className="flex h-16 w-full flex-row items-stretch justify-around">
        {mainNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                className={`flex flex-1 items-center justify-center px-1 py-2 transition-colors ${
                  active ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <FontAwesomeIcon icon={item.icon} className="h-6 w-6 shrink-0" aria-hidden />
                <span className="sr-only">{item.mobileLabel}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={() => openSettings(true)}
            className="flex flex-1 items-center justify-center px-1 py-2 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] active:text-[var(--fg)]"
            aria-label="Einstellungen öffnen"
          >
            <FontAwesomeIcon icon={faGear} className="h-6 w-6 shrink-0" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );

  return portalEl ? createPortal(nav, portalEl) : nav;
}
