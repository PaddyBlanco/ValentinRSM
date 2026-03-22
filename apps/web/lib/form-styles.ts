/** Gemeinsame Klassen für Formularfelder (schlicht, Haarstrich-Rahmen) */
export const inputClass =
  "w-full rounded-sm border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--fg-muted)]";

export const labelClass = "mb-1 block text-xs font-medium text-[var(--fg-muted)]";

export const buttonPrimaryClass =
  "rounded-sm border border-[var(--hairline)] bg-[var(--hover)] px-4 py-2 text-sm font-medium text-[var(--fg)] hover:bg-[var(--hairline)] disabled:opacity-50";

export const buttonGhostClass =
  "rounded-sm border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)]";

export const buttonDangerClass =
  "rounded-sm border border-red-900/40 bg-transparent px-4 py-2 text-sm text-red-600 hover:bg-red-950/30 dark:text-red-400";
