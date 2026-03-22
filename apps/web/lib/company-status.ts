import type { CompanyStatus } from "@/lib/api";

export const companyStatusLabel: Record<CompanyStatus, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

/** Listen-Sortierung: Aktiv → Im Blick → Ruhend → Archiviert */
export const companyStatusSortOrder: readonly CompanyStatus[] = ["active", "inFocus", "dormant", "archived"];

export function companyStatusRank(status: CompanyStatus): number {
  const i = companyStatusSortOrder.indexOf(status);
  return i === -1 ? companyStatusSortOrder.length : i;
}

/** Kleine Status-Pills (Startseite, Firmenliste). */
export function companyStatusTagClass(status: CompanyStatus): string {
  const base = "rounded-sm px-1 py-0.5 text-[10px] font-medium";
  switch (status) {
    case "active":
      return `${base} bg-emerald-500/15 text-emerald-800 dark:text-emerald-400`;
    case "inFocus":
      return `${base} bg-amber-500/15 text-amber-800 dark:text-amber-400`;
    case "dormant":
      return `${base} bg-slate-500/15 text-slate-700 dark:text-slate-400`;
    case "archived":
      return `${base} border border-[var(--hairline)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]`;
    default:
      return `${base} bg-[var(--hairline)] text-[var(--fg-muted)]`;
  }
}
