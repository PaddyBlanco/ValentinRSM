/**
 * Grobe relative Zeitangabe (ohne Minuten/Sekunden-Genauigkeit), z. B. für „letzte Aktivität“.
 */
export function formatRelativeActivityBrief(iso: string, now = new Date()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = now.getTime() - t;
  if (diffMs < 0) return "kürzlich";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 10) return "vor wenigen Minuten";
  if (minutes < 60) return "vor unter einer Stunde";

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) {
    return hours === 1 ? "vor 1 Stunde" : `vor ${hours} Stunden`;
  }

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) {
    return days === 1 ? "vor 1 Tag" : `vor ${days} Tagen`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? "vor 1 Woche" : `vor ${weeks} Wochen`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "vor 1 Monat" : `vor ${months} Monaten`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "vor 1 Jahr" : `vor ${years} Jahren`;
}
