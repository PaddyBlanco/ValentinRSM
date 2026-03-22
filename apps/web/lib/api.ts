export type CompanyStatus = "active" | "inFocus" | "dormant" | "archived";

export type Company = {
  id: string;
  name: string;
  type: string;
  status: CompanyStatus;
  accentColor: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  roleTitle: string | null;
  knowsFrom: string | null;
  capabilityNote: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TimelineEntry = {
  id: string;
  companyId: string;
  contactId: string | null;
  /** gesetzt, wenn ein Kontakt verknüpft ist */
  contactName: string | null;
  type: string;
  source: string;
  title: string;
  content: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

/** Default für lokales `dotnet run` (Port 5112). Docker/Web: NEXT_PUBLIC_API_URL zur Build-Zeit setzen (z. B. :8080). */
const defaultLocalApi = "http://localhost:5112";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? defaultLocalApi;
  }
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    defaultLocalApi
  );
}

function apiUrl(path: string): string {
  return `${getApiBaseUrl().replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
    next: init?.next ?? { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function deleteResource(path: string): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}

export type CreateCompanyBody = {
  name: string;
  type: string;
  status: CompanyStatus;
  accentColor: string | null;
  notes: string | null;
};

export async function createCompany(body: CreateCompanyBody): Promise<Company> {
  return postJson<Company>("/api/companies", body);
}

export async function updateCompany(id: string, body: CreateCompanyBody): Promise<Company> {
  return putJson<Company>(`/api/companies/${encodeURIComponent(id)}`, body);
}

export async function deleteCompany(id: string): Promise<void> {
  return deleteResource(`/api/companies/${encodeURIComponent(id)}`);
}

export type CreateContactBody = {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  roleTitle: string | null;
  knowsFrom: string | null;
  capabilityNote: string | null;
  notes: string | null;
};

export type UpdateContactBody = Omit<CreateContactBody, "companyId">;

export async function createContact(body: CreateContactBody): Promise<Contact> {
  return postJson<Contact>("/api/contacts", body);
}

export async function updateContact(id: string, body: UpdateContactBody): Promise<Contact> {
  return putJson<Contact>(`/api/contacts/${encodeURIComponent(id)}`, body);
}

export async function deleteContact(id: string): Promise<void> {
  return deleteResource(`/api/contacts/${encodeURIComponent(id)}`);
}

export type TimelineEntryType =
  | "email"
  | "meetingNote"
  | "callSummary"
  | "manualNote"
  | "researchNote";

export type TimelineSource =
  | "manual"
  | "email"
  | "botEmail"
  | "forwardedEmail"
  | "plaud"
  | "research"
  | "system";

export type CreateTimelineBody = {
  companyId: string;
  /** optional; fehlt oder leer = nur Firmenbezug */
  contactId?: string | null;
  type: TimelineEntryType;
  source: TimelineSource;
  title: string;
  content: string;
  occurredAt: string;
};

export async function createTimelineEntry(body: CreateTimelineBody): Promise<TimelineEntry> {
  return postJson<TimelineEntry>("/api/timelineentries", body);
}

export type UpdateTimelineBody = {
  type: TimelineEntryType;
  source: TimelineSource;
  title: string;
  content: string;
  occurredAt: string;
};

export async function updateTimelineEntry(id: string, body: UpdateTimelineBody): Promise<TimelineEntry> {
  return putJson<TimelineEntry>(`/api/timelineentries/${encodeURIComponent(id)}`, body);
}

export async function deleteTimelineEntry(id: string): Promise<void> {
  return deleteResource(`/api/timelineentries/${encodeURIComponent(id)}`);
}

export async function fetchCompanies(): Promise<Company[]> {
  return fetchJson<Company[]>("/api/companies");
}

export async function fetchCompany(id: string): Promise<Company> {
  return fetchJson<Company>(`/api/companies/${encodeURIComponent(id)}`);
}

export async function fetchContact(id: string): Promise<Contact> {
  return fetchJson<Contact>(`/api/contacts/${encodeURIComponent(id)}`);
}

export async function fetchContacts(params?: {
  companyId?: string;
  take?: number;
  sort?: "recent";
}): Promise<Contact[]> {
  const sp = new URLSearchParams();
  if (params?.companyId) sp.set("companyId", params.companyId);
  if (params?.take) sp.set("take", String(params.take));
  if (params?.sort) sp.set("sort", params.sort);
  const q = sp.toString();
  return fetchJson<Contact[]>(`/api/contacts${q ? `?${q}` : ""}`);
}

export async function fetchTimeline(params?: {
  companyId?: string;
  contactId?: string;
  take?: number;
}): Promise<TimelineEntry[]> {
  const sp = new URLSearchParams();
  if (params?.companyId) sp.set("companyId", params.companyId);
  if (params?.contactId) sp.set("contactId", params.contactId);
  if (params?.take) sp.set("take", String(params.take));
  const q = sp.toString();
  return fetchJson<TimelineEntry[]>(`/api/timelineentries${q ? `?${q}` : ""}`);
}

export type SearchCompanyHit = {
  id: string;
  name: string;
  type: string;
  status: CompanyStatus;
  accentColor: string | null;
};

export type SearchContactHit = {
  id: string;
  companyId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

export type SearchTimelineHit = {
  id: string;
  companyId: string;
  companyName: string;
  contactId: string | null;
  contactName: string | null;
  title: string;
  contentPreview: string;
  occurredAt: string;
  type: string;
  source: string;
};

export type SearchResponse = {
  query: string;
  companies: SearchCompanyHit[];
  contacts: SearchContactHit[];
  timelineEntries: SearchTimelineHit[];
};

export async function fetchSearch(q: string, take?: number): Promise<SearchResponse> {
  const sp = new URLSearchParams();
  sp.set("q", q);
  if (take != null) sp.set("take", String(take));
  return fetchJson<SearchResponse>(`/api/search?${sp.toString()}`);
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
