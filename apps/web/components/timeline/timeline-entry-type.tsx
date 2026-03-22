"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faEnvelope,
  faMagnifyingGlass,
  faNoteSticky,
  faPhone,
  faQuestion,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { TimelineEntryType } from "@/lib/api";

export const TIMELINE_ENTRY_TYPES: TimelineEntryType[] = [
  "email",
  "meetingNote",
  "callSummary",
  "manualNote",
  "researchNote",
];

export const timelineEntryTypeMeta: Record<
  TimelineEntryType,
  { label: string; icon: IconDefinition }
> = {
  email: { label: "E-Mail", icon: faEnvelope },
  meetingNote: { label: "Meeting", icon: faUsers },
  callSummary: { label: "Telefon", icon: faPhone },
  manualNote: { label: "Notiz", icon: faNoteSticky },
  researchNote: { label: "Recherche", icon: faMagnifyingGlass },
};

const fallback = { label: "Unbekannt", icon: faQuestion };

export function timelineEntryTypeLabel(type: string): string {
  const m = timelineEntryTypeMeta[type as TimelineEntryType];
  return m?.label ?? type;
}

/** Nur Icon (z. B. Sidebar, Feed), mit Tooltip/aria-label. */
export function TimelineEntryTypeIcon({
  type,
  className,
}: {
  type: string;
  /** z. B. `h-6 w-6` für Feed neben dem Titel */
  className?: string;
}) {
  const m = timelineEntryTypeMeta[type as TimelineEntryType] ?? fallback;
  return (
    <FontAwesomeIcon
      icon={m.icon}
      className={className ?? "h-3 w-3 shrink-0 opacity-90"}
      title={m.label}
      aria-label={m.label}
    />
  );
}

/** Icon + deutschsprachige Bezeichnung (Listen, Metazeile). */
export function TimelineEntryTypeBadge({ type }: { type: string }) {
  const m = timelineEntryTypeMeta[type as TimelineEntryType] ?? fallback;
  return (
    <span className="inline-flex items-center gap-1.5">
      <FontAwesomeIcon icon={m.icon} className="h-3.5 w-3.5 shrink-0 text-[var(--fg-muted)]" aria-hidden />
      <span>{m.label}</span>
    </span>
  );
}
