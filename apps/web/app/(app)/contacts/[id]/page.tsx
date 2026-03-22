"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contacts/contact-form";
import { MailtoLink, TelLink } from "@/components/contacts/contact-links";
import { Modal } from "@/components/ui/modal";
import { TimelineEntryForm } from "@/components/timeline/timeline-entry-form";
import { TimelineHtmlContent } from "@/components/timeline/timeline-html-content";
import { TimelineEntryTypeBadge } from "@/components/timeline/timeline-entry-type";
import { buttonDangerClass, buttonGhostClass } from "@/lib/form-styles";
import type { Company, Contact, CreateContactBody, TimelineEntry } from "@/lib/api";
import {
  createTimelineEntry,
  deleteContact,
  deleteTimelineEntry,
  fetchCompany,
  fetchContact,
  fetchContacts,
  fetchTimeline,
  formatDateTime,
  updateContact,
  updateTimelineEntry,
} from "@/lib/api";
import { timelineContentNeedsExpand } from "@/lib/timeline-entry-content";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyContacts, setCompanyContacts] = useState<Contact[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [timelineNewOpen, setTimelineNewOpen] = useState(false);
  const [timelineNewFormKey, setTimelineNewFormKey] = useState(0);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEntry | null>(null);
  const [timelineEditFormKey, setTimelineEditFormKey] = useState(0);
  const [timelineExpanded, setTimelineExpanded] = useState<Record<string, boolean>>({});

  async function reload() {
    const k = await fetchContact(id);
    setContact(k);
    const [co, tl, ct] = await Promise.all([
      fetchCompany(k.companyId),
      fetchTimeline({ contactId: id, take: 50 }),
      fetchContacts({ companyId: k.companyId }),
    ]);
    setCompany(co);
    setTimeline(tl);
    setCompanyContacts(ct);
  }

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        const k = await fetchContact(id);
        if (c) return;
        setContact(k);
        const [co, tl, ct] = await Promise.all([
          fetchCompany(k.companyId),
          fetchTimeline({ contactId: id, take: 50 }),
          fetchContacts({ companyId: k.companyId }),
        ]);
        if (!c) {
          setCompany(co);
          setTimeline(tl);
          setCompanyContacts(ct);
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

  async function onSaveContact(body: CreateContactBody) {
    if (!contact) return;
    const updated = await updateContact(contact.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      roleTitle: body.roleTitle,
      knowsFrom: body.knowsFrom,
      capabilityNote: body.capabilityNote,
      notes: body.notes,
    });
    setContact(updated);
    setEditContactOpen(false);
  }

  async function onDeleteContact() {
    if (!contact) return;
    if (!window.confirm(`Kontakt „${contact.firstName} ${contact.lastName}“ wirklich löschen?`)) return;
    await deleteContact(contact.id);
    setEditContactOpen(false);
    router.push("/contacts");
  }

  async function onDeleteTimelineEntry(evId: string) {
    if (!window.confirm("Diesen Timeline-Eintrag löschen?")) return;
    await deleteTimelineEntry(evId);
    setEditingTimeline(null);
    await reload();
  }

  if (err || !contact) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-sm text-[var(--fg-muted)]">{err ?? "Laden…"}</p>
        <Link href="/contacts" className="mt-4 inline-block text-sm hover:underline">
          ← Zurück
        </Link>
      </main>
    );
  }

  const contactOptions = companyContacts.map((k) => ({
    id: k.id,
    label: `${k.firstName} ${k.lastName}`,
  }));

  return (
    <main className="p-6 md:p-10">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              {company && (
                <Link href={`/companies/${company.id}`} className="hover:underline">
                  {company.name}
                </Link>
              )}
            </p>
          </div>
          <button type="button" className={buttonGhostClass} onClick={() => setEditContactOpen(true)}>
            Bearbeiten
          </button>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          {contact.email && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">E-Mail</dt>
              <dd>
                <MailtoLink email={contact.email} className="text-[var(--fg)] hover:underline" />
              </dd>
            </div>
          )}
          {contact.phone && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">Telefon</dt>
              <dd>
                <TelLink phone={contact.phone} className="text-[var(--fg)] hover:underline" />
              </dd>
            </div>
          )}
          {contact.roleTitle && (
            <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
              <dt className="w-28 text-[var(--fg-muted)]">Rolle</dt>
              <dd>{contact.roleTitle}</dd>
            </div>
          )}
        </dl>
        {contact.notes && <p className="mt-4 text-sm text-[var(--fg-muted)]">{contact.notes}</p>}
      </header>

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
          <TimelineEntryForm
            key={timelineNewFormKey}
            compact
            companyId={contact.companyId}
            contacts={contactOptions}
            defaultContactId={contact.id}
            submitLabel="Eintrag speichern"
            onSubmit={async (body) => {
              await createTimelineEntry(body);
              setTimelineNewOpen(false);
              await reload();
            }}
            onCancel={() => setTimelineNewOpen(false)}
          />
        </Modal>

        <Modal
          open={editingTimeline !== null}
          onClose={() => setEditingTimeline(null)}
          title="Timeline-Eintrag bearbeiten"
          xlarge
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
          {editingTimeline && (
            <TimelineEntryForm
              key={`${editingTimeline.id}-${timelineEditFormKey}`}
              compact
              largeEditor
              companyId={contact.companyId}
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
          {timeline.map((ev) => {
            const contentLong = ev.content ? timelineContentNeedsExpand(ev.content) : false;
            const contentExpanded = !!timelineExpanded[ev.id];
            return (
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
                {ev.content && (
                  <div className="mt-2">
                    <div
                      className={`text-[var(--fg-muted)] ${
                        contentLong && !contentExpanded ? "line-clamp-6 overflow-hidden" : ""
                      }`}
                    >
                      <TimelineHtmlContent content={ev.content} />
                    </div>
                    {contentLong && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                        aria-expanded={contentExpanded}
                        onClick={() =>
                          setTimelineExpanded((prev) => ({
                            ...prev,
                            [ev.id]: !prev[ev.id],
                          }))
                        }
                      >
                        {contentExpanded ? "Weniger" : "Mehr anzeigen"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {timeline.length === 0 && <li className="text-[var(--fg-muted)]">Keine Einträge.</li>}
        </ul>
      </section>

      <Modal
        open={editContactOpen}
        onClose={() => setEditContactOpen(false)}
        title="Kontakt bearbeiten"
        wide
        footer={
          <button type="button" className={buttonDangerClass} onClick={() => void onDeleteContact()}>
            Kontakt löschen
          </button>
        }
      >
        <ContactForm
          key={contact.id}
          compact
          initial={contact}
          companyName={company?.name}
          submitLabel="Speichern"
          onSubmit={onSaveContact}
          onCancel={() => setEditContactOpen(false)}
        />
      </Modal>
    </main>
  );
}
