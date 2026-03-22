"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CreateTimelineBody, TimelineEntry, TimelineEntryType, TimelineSource } from "@/lib/api";
import { buttonGhostClass, buttonPrimaryClass, inputClass, labelClass } from "@/lib/form-styles";
import { datetimeLocalToIso, isoToDatetimeLocal, nowDatetimeLocal } from "@/lib/datetime-local";
import { TimelineContentEditor } from "@/components/timeline/timeline-content-editor";
import { TIMELINE_ENTRY_TYPES, timelineEntryTypeMeta } from "@/components/timeline/timeline-entry-type";
import { sanitizeTimelineHtml } from "@/lib/sanitize-timeline-html";

const sourceOptions: { value: TimelineSource; label: string }[] = [
  { value: "manual", label: "Manuell" },
  { value: "email", label: "E-Mail" },
  { value: "botEmail", label: "Bot (E-Mail)" },
  { value: "forwardedEmail", label: "Weitergeleitet" },
  { value: "plaud", label: "Plaud" },
  { value: "research", label: "Recherche" },
  { value: "system", label: "System" },
];

const EMPTY_CONTACT = "";

export function TimelineEntryForm({
  companyId,
  contacts,
  defaultContactId,
  initial,
  compact,
  /** Größerer Inhalts-Editor (z. B. Bearbeiten-Modal) */
  largeEditor,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  /** Firma, zu der der Eintrag gehört */
  companyId: string;
  contacts: { id: string; label: string }[];
  defaultContactId?: string;
  initial?: TimelineEntry | null;
  /** ohne äußeren Rahmen (z. B. im Modal) */
  compact?: boolean;
  largeEditor?: boolean;
  submitLabel: string;
  onSubmit: (body: CreateTimelineBody) => Promise<void>;
  onCancel?: () => void;
}) {
  const [contactId, setContactId] = useState(() =>
    initial ? (initial.contactId ?? EMPTY_CONTACT) : (defaultContactId ?? EMPTY_CONTACT),
  );
  const [type, setType] = useState<TimelineEntryType>(() => (initial?.type as TimelineEntryType) ?? "manualNote");
  const [source, setSource] = useState<TimelineSource>(() => (initial?.source as TimelineSource) ?? "manual");
  const [title, setTitle] = useState(() => initial?.title ?? "");
  /** Sofort aus initial — sonst ist Tiptap beim ersten Render leer und übernimmt den Text nicht nach. */
  const [content, setContent] = useState(() => initial?.content ?? "");
  const [occurredLocal, setOccurredLocal] = useState(() =>
    initial ? isoToDatetimeLocal(initial.occurredAt) : nowDatetimeLocal(),
  );
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) {
      setContactId(defaultContactId ?? EMPTY_CONTACT);
      setType("manualNote");
      setSource("manual");
      setTitle("");
      setContent("");
      setOccurredLocal(nowDatetimeLocal());
      return;
    }
    setContactId(initial.contactId ?? EMPTY_CONTACT);
    setType(initial.type as TimelineEntryType);
    setSource(initial.source as TimelineSource);
    setTitle(initial.title);
    setContent(initial.content);
    setOccurredLocal(isoToDatetimeLocal(initial.occurredAt));
  }, [initial, defaultContactId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const t = title.trim();
    if (!t) {
      setFormErr("Titel ist ein Pflichtfeld.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        companyId,
        contactId: contactId ? contactId : null,
        type,
        source,
        title: t,
        content: sanitizeTimelineHtml(content),
        occurredAt: datetimeLocalToIso(occurredLocal),
      });
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  const isEdit = !!initial;
  const wrap = compact ? "space-y-4" : "max-w-xl space-y-4 border border-[var(--hairline)] p-4";

  return (
    <form onSubmit={handleSubmit} className={wrap}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
        {isEdit ? "Timeline-Eintrag bearbeiten" : "Neuer Timeline-Eintrag"}
      </p>
      {formErr && <p className="text-sm text-red-500">{formErr}</p>}
      <div>
        <label className={labelClass} htmlFor="tl-contact">
          Kontakt (optional)
        </label>
        <select
          id="tl-contact"
          className={inputClass}
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          disabled={isEdit}
        >
          <option value={EMPTY_CONTACT}>— Kein Kontakt —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="tl-type">
            Art
          </label>
          <select id="tl-type" className={inputClass} value={type} onChange={(e) => setType(e.target.value as TimelineEntryType)}>
            {TIMELINE_ENTRY_TYPES.map((value) => (
              <option key={value} value={value}>
                {timelineEntryTypeMeta[value].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="tl-source">
            Quelle
          </label>
          <select
            id="tl-source"
            className={inputClass}
            value={source}
            onChange={(e) => setSource(e.target.value as TimelineSource)}
          >
            {sourceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="tl-when">
          Zeitpunkt
        </label>
        <input
          id="tl-when"
          type="datetime-local"
          className={inputClass}
          value={occurredLocal}
          onChange={(e) => setOccurredLocal(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="tl-title">
          Titel
        </label>
        <input id="tl-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <span className={labelClass}>Inhalt</span>
        <div className="mt-1.5">
          <TimelineContentEditor value={content} onChange={setContent} disabled={busy} large={largeEditor} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className={buttonPrimaryClass} disabled={busy}>
          {busy ? "…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={buttonGhostClass} onClick={onCancel} disabled={busy}>
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
