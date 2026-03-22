"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Contact, CreateContactBody } from "@/lib/api";
import { buttonGhostClass, buttonPrimaryClass, inputClass, labelClass } from "@/lib/form-styles";

export function ContactForm({
  initial,
  compact,
  defaultCompanyId = "",
  companies,
  lockCompany = false,
  companyName,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Contact | null;
  compact?: boolean;
  defaultCompanyId?: string;
  companies?: { id: string; name: string }[];
  lockCompany?: boolean;
  /** Nur bei Bearbeitung: Anzeigename der Firma */
  companyName?: string;
  submitLabel: string;
  onSubmit: (body: CreateContactBody) => Promise<void>;
  onCancel?: () => void;
}) {
  const [companyId, setCompanyId] = useState(initial?.companyId ?? defaultCompanyId);
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [roleTitle, setRoleTitle] = useState(initial?.roleTitle ?? "");
  const [knowsFrom, setKnowsFrom] = useState(initial?.knowsFrom ?? "");
  const [capabilityNote, setCapabilityNote] = useState(initial?.capabilityNote ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const isEdit = !!initial;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setFormErr("Vor- und Nachname sind Pflichtfelder.");
      return;
    }
    if (!isEdit && !companyId) {
      setFormErr("Bitte eine Firma wählen.");
      return;
    }
    setBusy(true);
    try {
      const body: CreateContactBody = {
        companyId: initial?.companyId ?? companyId,
        firstName: fn,
        lastName: ln,
        email: email.trim() || null,
        phone: phone.trim() || null,
        roleTitle: roleTitle.trim() || null,
        knowsFrom: knowsFrom.trim() || null,
        capabilityNote: capabilityNote.trim() || null,
        notes: notes.trim() || null,
      };
      await onSubmit(body);
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "max-w-xl space-y-4"}>
      {formErr && <p className="text-sm text-red-500">{formErr}</p>}
      {isEdit && initial && (
        <p className="text-sm text-[var(--fg-muted)]">
          Firma:{" "}
          <Link href={`/companies/${initial.companyId}`} className="text-[var(--fg)] hover:underline">
            {companyName ?? "Zur Firma"}
          </Link>
        </p>
      )}
      {!isEdit && companies && companies.length > 0 && (
        <div>
          <label className={labelClass} htmlFor="ct-company">
            Firma
          </label>
          <select
            id="ct-company"
            className={inputClass}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            disabled={lockCompany}
          >
            <option value="">— wählen —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ct-fn">
            Vorname
          </label>
          <input
            id="ct-fn"
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ct-ln">
            Nachname
          </label>
          <input
            id="ct-ln"
            className={inputClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-email">
          E-Mail
        </label>
        <input
          id="ct-email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-phone">
          Telefon
        </label>
        <input
          id="ct-phone"
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-role">
          Rolle / Position
        </label>
        <input id="ct-role" className={inputClass} value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-knows">
          Woher kenne ich ihn/sie
        </label>
        <input id="ct-knows" className={inputClass} value={knowsFrom} onChange={(e) => setKnowsFrom(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-cap">
          Was kann er/sie
        </label>
        <textarea
          id="ct-cap"
          className={`${inputClass} min-h-[72px] resize-y`}
          value={capabilityNote}
          onChange={(e) => setCapabilityNote(e.target.value)}
          rows={2}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="ct-notes">
          Notizen
        </label>
        <textarea
          id="ct-notes"
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
