"use client";

import { useState, type FormEvent } from "react";
import type { Company, CompanyStatus, CreateCompanyBody } from "@/lib/api";
import { buttonGhostClass, buttonPrimaryClass, inputClass, labelClass } from "@/lib/form-styles";

const statusOptions: { value: CompanyStatus; label: string }[] = [
  { value: "active", label: "Aktiv" },
  { value: "inFocus", label: "Im Blick" },
  { value: "dormant", label: "Ruhend" },
  { value: "archived", label: "Archiviert" },
];

export function CompanyForm({
  initial,
  compact,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Company | null;
  /** ohne max-w-xl (z. B. im Modal) */
  compact?: boolean;
  submitLabel: string;
  onSubmit: (body: CreateCompanyBody) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [status, setStatus] = useState<CompanyStatus>(initial?.status ?? "active");
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const n = name.trim();
    const t = type.trim();
    if (!n || !t) {
      setFormErr("Name und Typ sind Pflichtfelder.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        name: n,
        type: t,
        status,
        accentColor: accentColor.trim() || null,
        notes: notes.trim() || null,
      });
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "max-w-xl space-y-4"}>
      {formErr && <p className="text-sm text-red-500">{formErr}</p>}
      <div>
        <label className={labelClass} htmlFor="co-name">
          Name
        </label>
        <input
          id="co-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="organization"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="co-type">
          Typ (Freitext)
        </label>
        <input
          id="co-type"
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          placeholder="z. B. Kunde, Bank, Partner"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="co-status">
          Status
        </label>
        <select
          id="co-status"
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as CompanyStatus)}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="co-color">
          Kennfarbe (optional, z. B. #2563eb)
        </label>
        <input
          id="co-color"
          className={inputClass}
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
          placeholder="#RRGGBB"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="co-notes">
          Notizen
        </label>
        <textarea
          id="co-notes"
          className={`${inputClass} min-h-[100px] resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
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
