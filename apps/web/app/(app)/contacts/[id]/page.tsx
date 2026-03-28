"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contacts/contact-form";
import { MailtoLink, TelLink } from "@/components/contacts/contact-links";
import { Modal } from "@/components/ui/modal";
import { TimelineEntryForm } from "@/components/timeline/timeline-entry-form";
import { TimelineHtmlContent } from "@/components/timeline/timeline-html-content";
import { TimelineEntryTypeStamp } from "@/components/timeline/timeline-entry-type";
import { TimelineLoadSentinel } from "@/components/timeline/timeline-load-sentinel";
import { buttonDangerClass, buttonGhostClass } from "@/lib/form-styles";
import type { Company, Contact, CreateContactBody, TimelineEntry } from "@/lib/api";
import {
  createTimelineEntry,
  deleteContact,
  deleteTimelineEntry,
  fetchCompany,
  fetchContact,
  fetchContacts,
  formatDateTime,
  updateContact,
  updateTimelineEntry,
} from "@/lib/api";
import { timelineContentNeedsExpand } from "@/lib/timeline-entry-content";
import { useInfiniteTimeline } from "@/lib/use-infinite-timeline";
import { useBumpNavRefresh } from "@/components/layout/nav-refresh-context";

const statusLabel: Record<string, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const sessionReady = sessionStatus !== "loading";
  const bumpNavRefresh = useBumpNavRefresh();
  const id = params.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyContacts, setCompanyContacts] = useState<Contact[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [timelineNewOpen, setTimelineNewOpen] = useState(false);
  const [timelineNewFormKey, setTimelineNewFormKey] = useState(0);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEntry | null>(null);
  const [timelineEditFormKey, setTimelineEditFormKey] = useState(0);
  const [timelineExpanded, setTimelineExpanded] = useState<Record<string, boolean>>({});
  const [contactTab, setContactTab] = useState<"details" | "timeline">("details");

  const {
    items: timeline,
    loading: timelineLoading,
    loadingMore: timelineLoadingMore,
    hasMore: timelineHasMore,
    err: timelineErr,
    loadMore: loadMoreTimeline,
    refresh: refreshTimeline,
  } = useInfiniteTimeline({ contactId: id }, { enabled: Boolean(id) });

  async function reload() {
    const k = await fetchContact(id);
    setContact(k);
    const [co, ct] = await Promise.all([fetchCompany(k.companyId), fetchContacts({ companyId: k.companyId })]);
    setCompany(co);
    setCompanyContacts(ct);
    await refreshTimeline();
  }

  useEffect(() => {
    if (!id || !sessionReady) return;
    let c = false;
    (async () => {
      try {
        const k = await fetchContact(id);
        if (c) return;
        setContact(k);
        const [co, ct] = await Promise.all([fetchCompany(k.companyId), fetchContacts({ companyId: k.companyId })]);
        if (!c) {
          setCompany(co);
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
  }, [id, sessionReady]);

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
    bumpNavRefresh();
  }

  async function onDeleteContact() {
    if (!contact) return;
    if (!window.confirm(`Kontakt „${contact.firstName} ${contact.lastName}“ wirklich löschen?`)) return;
    await deleteContact(contact.id);
    setEditContactOpen(false);
    bumpNavRefresh();
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
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
        <header className="border-b border-[var(--hairline)] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-start gap-3">
              {company?.accentColor ? (
                <span
                  className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)]"
                  style={{ backgroundColor: company.accentColor }}
                />
              ) : (
                <span className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-25" />
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-medium">
                  {contact.firstName} {contact.lastName}
                </h1>
                {company && (
                  <p className="mt-1 text-sm text-[var(--fg-muted)]">
                    <Link
                      href={`/companies/${company.id}`}
                      className="inline-flex items-center gap-1.5 hover:text-[var(--fg)] hover:underline"
                    >
                      {company.accentColor ? (
                        <span
                          className="h-2 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                          style={{ backgroundColor: company.accentColor }}
                          aria-hidden
                        />
                      ) : (
                        <span className="h-2 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-40" aria-hidden />
                      )}
                      <span>{company.name}</span>
                    </Link>
                    {contact.roleTitle && (
                      <span>
                        {" "}
                        · {contact.roleTitle}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button type="button" className={buttonGhostClass} onClick={() => setEditContactOpen(true)}>
              Bearbeiten
            </button>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Kontakt Abschnitte"
          className="mt-6 flex gap-8 border-b border-[var(--hairline)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={contactTab === "details"}
            id="tab-contact-details"
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
              contactTab === "details"
                ? "border-[var(--fg)] text-[var(--fg)]"
                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
            onClick={() => setContactTab("details")}
          >
            Kontakt
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={contactTab === "timeline"}
            id="tab-contact-timeline"
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
              contactTab === "timeline"
                ? "border-[var(--fg)] text-[var(--fg)]"
                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
            onClick={() => setContactTab("timeline")}
          >
            Timeline
          </button>
        </div>

        {contactTab === "details" && (
          <section className="mt-6" role="tabpanel" aria-labelledby="tab-contact-details">
            <dl className="grid gap-2 text-sm">
              {contact.email && (
                <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
                  <dt className="w-28 shrink-0 text-[var(--fg-muted)]">E-Mail</dt>
                  <dd>
                    <MailtoLink email={contact.email} className="text-[var(--fg)] hover:underline" />
                  </dd>
                </div>
              )}
              {contact.phone && (
                <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
                  <dt className="w-28 shrink-0 text-[var(--fg-muted)]">Telefon</dt>
                  <dd>
                    <TelLink phone={contact.phone} className="text-[var(--fg)] hover:underline" />
                  </dd>
                </div>
              )}
              {contact.roleTitle && (
                <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
                  <dt className="w-28 shrink-0 text-[var(--fg-muted)]">Rolle</dt>
                  <dd>{contact.roleTitle}</dd>
                </div>
              )}
              {contact.knowsFrom && (
                <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
                  <dt className="w-28 shrink-0 text-[var(--fg-muted)]">Kennen wir von</dt>
                  <dd>{contact.knowsFrom}</dd>
                </div>
              )}
              {contact.capabilityNote && (
                <div className="flex gap-2 border-b border-[var(--hairline)] py-1">
                  <dt className="w-28 shrink-0 text-[var(--fg-muted)]">Kompetenz</dt>
                  <dd className="min-w-0">{contact.capabilityNote}</dd>
                </div>
              )}
            </dl>
            {contact.notes && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)]">{contact.notes}</p>
            )}

            {company && (
              <div className="mt-8 rounded-2xl border border-[var(--hairline)] bg-[var(--bg-elevated)] p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">Firma</p>
                <Link
                  href={`/companies/${company.id}`}
                  className="mt-2 inline-flex max-w-full min-w-0 items-center gap-2 font-medium hover:underline"
                >
                  {company.accentColor ? (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--hairline)]"
                      style={{ backgroundColor: company.accentColor }}
                      aria-hidden
                    />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fg-muted)] opacity-40" aria-hidden />
                  )}
                  <span className="truncate">{company.name}</span>
                </Link>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  {company.type} · {statusLabel[company.status] ?? company.status}
                </p>
              </div>
            )}
          </section>
        )}

        {contactTab === "timeline" && (
          <section className="mt-6" role="tabpanel" aria-labelledby="tab-contact-timeline">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="sr-only">Timeline</h2>
              <button
                type="button"
                className="rounded-full border border-[var(--hairline)] bg-[var(--hover)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] hover:bg-[var(--hairline)]"
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

            {timelineErr && <p className="mb-3 text-sm text-red-500">{timelineErr}</p>}
            {timelineLoading && (
              <p className="mb-4 text-sm text-[var(--fg-muted)]">Timeline wird geladen…</p>
            )}
            <ul className="w-full space-y-4">
              {timeline.map((ev) => {
                const contentLong = ev.content ? timelineContentNeedsExpand(ev.content) : false;
                const contentExpanded = !!timelineExpanded[ev.id];
                return (
                  <li key={ev.id}>
                    <article className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--bg-elevated)] shadow-sm">
                      <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                        <TimelineEntryTypeStamp type={ev.type} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                            <h3 className="text-base font-semibold leading-snug text-[var(--fg)]">{ev.title}</h3>
                            <button
                              type="button"
                              className="shrink-0 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
                              onClick={() => {
                                setTimelineEditFormKey((k) => k + 1);
                                setEditingTimeline(ev);
                              }}
                            >
                              Bearbeiten
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-[var(--fg-muted)]">
                            {formatDateTime(ev.occurredAt)}
                            <span aria-hidden className="mx-1.5">
                              ·
                            </span>
                            {ev.source}
                            {ev.contactId && ev.contactName && (
                              <>
                                <span aria-hidden className="mx-1.5">
                                  ·
                                </span>
                                <Link href={`/contacts/${ev.contactId}`} className="hover:text-[var(--fg)] hover:underline">
                                  {ev.contactName}
                                </Link>
                              </>
                            )}
                          </p>
                          {ev.content && (
                            <div className="mt-3">
                              <div
                                className={
                                  contentLong && !contentExpanded ? "line-clamp-6 overflow-hidden" : ""
                                }
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
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
              {!timelineLoading && timeline.length === 0 && (
                <li className="rounded-2xl border border-dashed border-[var(--hairline)] py-12 text-center text-sm text-[var(--fg-muted)]">
                  Noch keine Einträge.
                </li>
              )}
            </ul>
            {!timelineLoading && timelineHasMore && (
              <TimelineLoadSentinel
                onLoadMore={loadMoreTimeline}
                hasMore={timelineHasMore}
                loadingInitial={timelineLoading}
              />
            )}
            {timelineLoadingMore && (
              <p className="mt-3 text-center text-xs text-[var(--fg-muted)]">Weitere Einträge werden geladen…</p>
            )}
          </section>
        )}

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
      </div>
    </main>
  );
}
