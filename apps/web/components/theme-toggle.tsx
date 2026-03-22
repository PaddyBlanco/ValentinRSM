"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full border border-[var(--hairline)] px-3 py-2 text-left text-xs text-[var(--fg-muted)] transition hover:bg-[var(--hover)]"
    >
      {isDark ? "Hellmodus" : "Dunkelmodus"}
    </button>
  );
}
