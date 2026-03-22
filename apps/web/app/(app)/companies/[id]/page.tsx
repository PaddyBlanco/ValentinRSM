"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyForm } from "@/components/companies/company-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { MailtoLink } from "@/components/contacts/contact-links";
import { Modal } from "@/components/ui/modal";
import { TimelineEntryForm } from "@/components/timeline/timeline-entry-form";
import { TimelineHtmlContent } from "@/components/timeline/timeline-html-content";
import { TimelineEntryTypeStamp } from "@/components/timeline/timeline-entry-type";
import { buttonDangerClass, buttonGhostClass } from "@/lib/form-styles";
import type { Company, Contact, CreateCompanyBody, TimelineEntry } from "@/lib/api";
import {
  createContact,
  createTimelineEntry,
  deleteCompany,
  deleteTimelineEntry,
  fetchCompany,
  fetchContacts,
  formatDateTime,
  updateCompany,
  updateTimelineEntry,
} from "@/lib/api";
import { timelineContentNeedsExpand } from "@/lib/timeline-entry-content";
import { useInfiniteTimeline } from "@/lib/use-infinite-timeline";
import { TimelineLoadSentinel } from "@/components/timeline/timeline-load-sentinel";
import { useBumpNavRefresh } from "@/components/layout/nav-refresh-context";

const statusLabel: Record<string, string> = {
  active: "Aktiv",
  inFocus: "Im Blick",
  dormant: "Ruhend",
  archived: "Archiviert",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bumpNavRefresh = useBumpNavRefresh();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [newContactFormKey, setNewContactFormKey] = useState(0);
  const [timelineNewOpen, setTimelineNewOpen] = useState(false);
  const [timelineNewFormKey, setTimelineNewFormKey] = useState(0);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEntry | null>(null);
  const [timelineEditFormKey, setTimelineEditFormKey] = useState(0);
  const [timelineExpanded, setTimelineExpanded] = useState<Record<string, boolean>>({});
  const [companyTab, setCompanyTab] = useState<"timeline" | "contacts">("timeline");

  const {
    items: timeline,
    loading: timelineLoading,
    loadingMore: timelineLoadingMore,
    hasMore: timelineHasMore,
    err: timelineErr,
    loadMore: loadMoreTimeline,
    refresh: refreshTimeline,
  } = useInfiniteTimeline({ companyId: id }, { enabled: Boolean(id) });

  async function reload() {
    const [co, ct] = await Promise.all([fetchCompany(id), fetchContacts({ companyId: id })]);
    setCompany(co);
    setContacts(ct);
    await refreshTimeline();
  }

  useEffect(() => {
    if (!id) return;
    let c = false;
    (async () => {
      try {
        const [co, ct] = await Promise.all([fetchCompany(id), fetchContacts({ companyId: id })]);
        if (!c) {
          setCompany(co);
          setContacts(ct);
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
    bumpNavRefresh();
  }

  async function onDeleteCompany() {
    if (!company) return;
    if (!window.confirm(`Firma „${company.name}“ wirklich löschen? Zugehörige Kontakte und Timeline werden mitgelöscht.`)) {
      return;
    }
    await deleteCompany(company.id);
    setEditCompanyOpen(false);
    bumpNavRefresh();
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
      <div className="mx-auto w-[98%] max-w-full md:w-[80%]">
      <header className="border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-3">
            {company.accentColor ? (
              <span
                className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)]"
                style={{ backgroundColor: company.accentColor }}
              />
            ) : (
              <span className="mt-1 h-8 w-8 shrink-0 rounded border border-[var(--hairline)] bg-[var(--fg-muted)] opacity-25" />
            )}
            <div className="min-w-0">
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
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)]">{company.notes}</p>
        )}
      </header>

      <div
        role="tablist"
        aria-label="Firma Abschnitte"
        className="mt-6 flex gap-8 border-b border-[var(--hairline)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={companyTab === "timeline"}
          id="tab-timeline"
          className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
            companyTab === "timeline"
              ? "border-[var(--fg)] text-[var(--fg)]"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
          onClick={() => setCompanyTab("timeline")}
        >
          Timeline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={companyTab === "contacts"}
          id="tab-contacts"
          className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
            companyTab === "contacts"
              ? "border-[var(--fg)] text-[var(--fg)]"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
          onClick={() => setCompanyTab("contacts")}
        >
          Kontakte
          {contacts.length > 0 && (
            <span className="ml-1.5 tabular-nums text-[var(--fg-muted)]">({contacts.length})</span>
          )}
        </button>
      </div>

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

      {companyTab === "timeline" && (
      <section className="mt-6" role="tabpanel" aria-labelledby="tab-timeline">
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
            companyId={company.id}
            contacts={contactOptions}
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
              companyId={company.id}
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

      {companyTab === "contacts" && (
        <section className="mt-6" role="tabpanel" aria-labelledby="tab-contacts">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--bg-elevated)]">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--hairline)] px-3 py-2.5">
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
            <ul className="max-h-[min(520px,65vh)] overflow-y-auto overscroll-contain text-sm">
              {contacts.map((k) => (
                <li key={k.id} className="border-b border-[var(--hairline)] last:border-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5">
                    <Link href={`/contacts/${k.id}`} className="font-medium hover:underline">
                      {k.firstName} {k.lastName}
                    </Link>
                    {k.email && (
                      <MailtoLink email={k.email} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]" />
                    )}
                  </div>
                </li>
              ))}
              {contacts.length === 0 && (
                <li className="px-3 py-10 text-center text-[var(--fg-muted)]">Keine Kontakte.</li>
              )}
            </ul>
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
