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

/** Farben für Art-Stempel (Icon-Kreis + Beschriftung). */
export type TimelineEntryStampStyles = {
  bg: string;
  icon: string;
  label: string;
};

export const timelineEntryTypeMeta: Record<
  TimelineEntryType,
  { label: string; icon: IconDefinition; stamp: TimelineEntryStampStyles }
> = {
  email: {
    label: "E-Mail",
    icon: faEnvelope,
    stamp: {
      bg: "bg-sky-500/15",
      icon: "text-sky-600 dark:text-sky-400",
      label: "text-sky-700 dark:text-sky-400",
    },
  },
  meetingNote: {
    label: "Meeting",
    icon: faUsers,
    stamp: {
      bg: "bg-violet-500/15",
      icon: "text-violet-600 dark:text-violet-400",
      label: "text-violet-700 dark:text-violet-400",
    },
  },
  callSummary: {
    label: "Telefon",
    icon: faPhone,
    stamp: {
      bg: "bg-amber-500/15",
      icon: "text-amber-600 dark:text-amber-400",
      label: "text-amber-800 dark:text-amber-400",
    },
  },
  manualNote: {
    label: "Notiz",
    icon: faNoteSticky,
    stamp: {
      bg: "bg-stone-500/15",
      icon: "text-stone-600 dark:text-stone-400",
      label: "text-stone-700 dark:text-stone-400",
    },
  },
  researchNote: {
    label: "Recherche",
    icon: faMagnifyingGlass,
    stamp: {
      bg: "bg-emerald-500/15",
      icon: "text-emerald-600 dark:text-emerald-400",
      label: "text-emerald-800 dark:text-emerald-400",
    },
  },
};

const fallback = {
  label: "Unbekannt",
  icon: faQuestion,
  stamp: {
    bg: "bg-neutral-500/15",
    icon: "text-neutral-600 dark:text-neutral-400",
    label: "text-neutral-600 dark:text-neutral-400",
  },
};

export function timelineEntryTypeLabel(type: string): string {
  const m = timelineEntryTypeMeta[type as TimelineEntryType];
  return m?.label ?? type;
}

/** Nur Icon (z. B. Sidebar), mit Tooltip/aria-label. Optional in Art-Farbe. */
export function TimelineEntryTypeIcon({
  type,
  className,
  colorful,
}: {
  type: string;
  /** z. B. `h-6 w-6` für Feed neben dem Titel */
  className?: string;
  /** Eigene Art-Farbe statt Standard-Muted */
  colorful?: boolean;
}) {
  const m = timelineEntryTypeMeta[type as TimelineEntryType] ?? fallback;
  const colorClass = colorful ? m.stamp.icon : "";
  return (
    <FontAwesomeIcon
      icon={m.icon}
      className={`${className ?? "h-3 w-3 shrink-0 opacity-90"} ${colorClass}`.trim()}
      title={m.label}
      aria-label={m.label}
    />
  );
}

/** Farbiges Art-Icon im Kreis + Art-Name darunter (Timeline-Karten, Ereignisse). */
export function TimelineEntryTypeStamp({ type }: { type: string }) {
  const m = timelineEntryTypeMeta[type as TimelineEntryType] ?? fallback;
  return (
    <div
      className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 pt-0.5"
      role="group"
      aria-label={`Art: ${m.label}`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${m.stamp.bg} ${m.stamp.icon}`}
        aria-hidden
      >
        <FontAwesomeIcon icon={m.icon} className="h-5 w-5" />
      </span>
      <span className={`max-w-full text-center text-[10px] font-medium leading-tight ${m.stamp.label}`}>
        {m.label}
      </span>
    </div>
  );
}

/** Icon + deutschsprachige Bezeichnung (Listen, Metazeile). */
export function TimelineEntryTypeBadge({ type }: { type: string }) {
  const m = timelineEntryTypeMeta[type as TimelineEntryType] ?? fallback;
  return (
    <span className="inline-flex items-center gap-1.5">
      <FontAwesomeIcon icon={m.icon} className={`h-3.5 w-3.5 shrink-0 ${m.stamp.icon}`} aria-hidden />
      <span className="text-[var(--fg-muted)]">{m.label}</span>
    </span>
  );
}
