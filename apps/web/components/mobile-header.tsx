"use client";

import Link from "next/link";
import { LogoMark } from "./logo-mark";
import { ThemeToggle } from "./theme-toggle";

/** Kompakte Kopfzeile nur unter md: Logo + Theme (Sidebar entfällt). */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-[var(--hairline)] bg-[var(--bg)] px-4 py-3 md:hidden">
      <Link href="/" className="min-w-0 text-[var(--fg)]">
        <span className="sr-only">ValentinRSM</span>
        <LogoMark className="h-7 w-auto max-w-[min(100%,220px)]" />
      </Link>
      <ThemeToggle />
    </header>
  );
}
