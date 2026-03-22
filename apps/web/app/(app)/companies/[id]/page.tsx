"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyForm } from "@/components/company-form";
import { ContactForm } from "@/components/contact-form";
import { MailtoLink } from "@/components/contact-links";
import { Modal } from "@/components/modal";
import { TimelineEntryForm } from "@/components/timeline-entry-form";
import { TimelineEntryTypeBadge } from "@/components/timeline-entry-type";
import { buttonDangerClass, buttonGhostClass } from "@/lib/form-styles";
import type { Company, Contact, CreateCompanyBody, TimelineEntry } from "@/lib/api";
import {
  createContact,
  createTimelineEntry,
  deleteCompany,
  deleteTimelineEntry,
  fetchCompany,
  fetchContacts,
  fetchTimeline,
  formatDateTime,
  updateCompany,
  updateTimelineEntry,
} from "@/lib/api";

const statusLabel: Record<string, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [newContactFormKey, setNewContactFormKey] = useState(0);
  const [timelineNewOpen, setTimelineNewOpen] = useState(false);
  const [timelineNewFormKey, setTimelineNewFormKey] = useState(0);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEntry | null>(null);
  const [timelineEditFormKey, setTimelineEditFormKey] = useState(0);

  async function reload() {
    const [co, ct, tl] = await Promise.all([
      fetchCompany(id),
      fetchContacts({ companyId: id }),
      fetchTimeline({ companyId: id, take: 50 }),
    ]);
    setCompany(co);
    setContacts(ct);
    setTimeline(tl);
  }

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        const [co, ct, tl] = await Promise.all([
          fetchCompany(id),
          fetchContacts({ companyId: id }),
          fetchTimeline({ companyId: id, take: 50 }),
        ]);
        if (!c) {
          setCompany(co);
          setContacts(ct);
          setTimeline(tl);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!c) setErr(e instanceof Error ? e.message : "Nicht gefunden");
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  async function onSaveCompany(body: CreateCompanyBody) {
    if (!company) return;
    const updated = await updateCompany(company.id, body);
    setCompany(updated);
    setEditCompanyOpen(false);
  }

  async function onDeleteCompany() {
    if (!company) return;
    if (!window.confirm(`Firma „${company.name}“ wirklich löschen? Zugehörige Kontakte und Timeline werden mitgelöscht.`)) {
      return;
    }
    await deleteCompany(company.id);
    setEditCompanyOpen(false);
    router.push("/companies");
  }

  async function onDeleteTimelineEntry(evId: string) {
    if (!window.confirm("Diesen Timeline-Eintrag löschen?")) return;
    await deleteTimelineEntry(evId);
    setEditingTimeline(null);
    await reload();
  }

  if (err || !company) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-sm text-[var(--fg-muted)]">{err ?? "Laden…"}</p>
        <Link href="/companies" className="mt-4 inline-block text-sm hover:underline">
          ← Zurück
        </Link>
      </main>
    );
  }

  const contactOptions = contacts.map((k) => ({
    id: k.id,
    label: `${k.firstName} ${k.lastName}`,
  }));

  const companyOpts = [{ id: company.id, name: company.name }];

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-3">
            {company.accentColor && (
              <span
                className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)]"
                style={{ backgroundColor: company.accentColor }}
              />
            )}
            <div>
              <h1 className="text-xl font-medium">{company.name}</h1>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                {company.type} · {statusLabel[company.status] ?? company.status}
              </p>
            </div>
          </div>
          <button type="button" className={buttonGhostClass} onClick={() => setEditCompanyOpen(true)}>
            Bearbeiten
          </button>
        </div>
        {company.notes && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">{company.notes}</p>
        )}
      </header>

      <Modal
        open={editCompanyOpen}
        onClose={() => setEditCompanyOpen(false)}
        title="Firma bearbeiten"
        footer={
          <button type="button" className={buttonDangerClass} onClick={() => void onDeleteCompany()}>
            Firma löschen
          </button>
        }
      >
        <CompanyForm
          key={company.id}
          compact
          initial={company}
          submitLabel="Speichern"
          onSubmit={onSaveCompany}
          onCancel={() => setEditCompanyOpen(false)}
        />
      </Modal>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-2">
          <h2 className="text-sm font-medium">Kontakte</h2>
          <button
            type="button"
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
            onClick={() => {
              setNewContactFormKey((k) => k + 1);
              setNewContactOpen(true);
            }}
          >
            + Neuer Kontakt
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {contacts.map((k) => (
            <li key={k.id} className="flex border-b border-[var(--hairline)] py-2 last:border-0">
              <Link href={`/contacts/${k.id}`} className="hover:underline">
                {k.firstName} {k.lastName}
              </Link>
              {k.email && (
                <MailtoLink email={k.email} className="ml-3 text-[var(--fg-muted)] hover:text-[var(--fg)]" />
              )}
            </li>
          ))}
          {contacts.length === 0 && <li className="text-[var(--fg-muted)]">Keine Kontakte.</li>}
        </ul>
      </section>

      <Modal open={newContactOpen} onClose={() => setNewContactOpen(false)} title="Neuer Kontakt" wide>
        <ContactForm
          key={newContactFormKey}
          compact
          defaultCompanyId={company.id}
          companies={companyOpts}
          lockCompany
          submitLabel="Kontakt anlegen"
          onSubmit={async (body) => {
            const k = await createContact(body);
            setNewContactOpen(false);
            await reload();
            router.push(`/contacts/${k.id}`);
          }}
          onCancel={() => setNewContactOpen(false)}
        />
      </Modal>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-2">
          <h2 className="text-sm font-medium">Timeline</h2>
          <button
            type="button"
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
            onClick={() => {
              setTimelineNewFormKey((k) => k + 1);
              setTimelineNewOpen(true);
            }}
          >
            + Eintrag
          </button>
        </div>

        <Modal open={timelineNewOpen} onClose={() => setTimelineNewOpen(false)} title="Neuer Timeline-Eintrag" wide>
          {contactOptions.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)]">Legen Sie zuerst einen Kontakt an.</p>
          ) : (
            <TimelineEntryForm
              key={timelineNewFormKey}
              compact
              contacts={contactOptions}
              submitLabel="Eintrag speichern"
              onSubmit={async (body) => {
                await createTimelineEntry(body);
                setTimelineNewOpen(false);
                await reload();
              }}
              onCancel={() => setTimelineNewOpen(false)}
            />
          )}
        </Modal>

        <Modal
          open={editingTimeline !== null}
          onClose={() => setEditingTimeline(null)}
          title="Timeline-Eintrag bearbeiten"
          wide
          footer={
            editingTimeline ? (
              <button
                type="button"
                className={buttonDangerClass}
                onClick={() => void onDeleteTimelineEntry(editingTimeline.id)}
              >
                Eintrag löschen
              </button>
            ) : null
          }
        >
          {editingTimeline && contactOptions.length > 0 && (
            <TimelineEntryForm
              key={`${editingTimeline.id}-${timelineEditFormKey}`}
              compact
              contacts={contactOptions}
              initial={editingTimeline}
              submitLabel="Änderungen speichern"
              onSubmit={async (body) => {
                await updateTimelineEntry(editingTimeline.id, {
                  type: body.type,
                  source: body.source,
                  title: body.title,
                  content: body.content,
                  occurredAt: body.occurredAt,
                });
                setEditingTimeline(null);
                await reload();
              }}
              onCancel={() => setEditingTimeline(null)}
            />
          )}
        </Modal>

        <ul className="space-y-4 text-sm">
          {timeline.map((ev) => (
            <li key={ev.id} className="border-b border-[var(--hairline)] pb-4 last:border-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="font-medium">{ev.title}</div>
                <button
                  type="button"
                  className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                  onClick={() => {
                    setTimelineEditFormKey((k) => k + 1);
                    setEditingTimeline(ev);
                  }}
                >
                  Bearbeiten
                </button>
              </div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">
                <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span>{formatDateTime(ev.occurredAt)}</span>
                  <span aria-hidden>·</span>
                  <TimelineEntryTypeBadge type={ev.type} />
                  <span aria-hidden>·</span>
                  <span>{ev.source}</span>
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[var(--fg-muted)]">{ev.content}</p>
            </li>
          ))}
          {timeline.length === 0 && <li className="text-[var(--fg-muted)]">Keine Einträge.</li>}
        </ul>
      </section>
    </main>
  );
}
