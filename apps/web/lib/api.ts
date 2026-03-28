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
  /** Neuester Timeline-Eintrag mit diesem Kontakt (ContactId), sonst null */
  lastTimelineAt?: string | null;
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

type BearerGetter = () => string | null | undefined;

let getBearerToken: BearerGetter = () => undefined;

/** Wird vom Client (`ApiBearerBridge`) gesetzt, damit Entra-Tokens mitgesendet werden. */
export function setApiBearerTokenGetter(fn: BearerGetter) {
  getBearerToken = fn;
}

function withAuthHeaders(init?: RequestInit): RequestInit {
  const token = getBearerToken?.();
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  return { ...init, headers };
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const merged = withAuthHeaders(init);
  const res = await fetch(apiUrl(path), {
    ...merged,
    next: init?.next ?? { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const merged = withAuthHeaders({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await fetch(apiUrl(path), merged);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const merged = withAuthHeaders({
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await fetch(apiUrl(path), merged);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function deleteResource(path: string): Promise<void> {
  const merged = withAuthHeaders({ method: "DELETE" });
  const res = await fetch(apiUrl(path), merged);
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

/** Firmen Aktiv/Im Blick mit letztem Timeline-Ereignis (Startseite). */
export type CompanyRecentActivity = {
  id: string;
  name: string;
  type: string;
  status: CompanyStatus;
  accentColor: string | null;
  lastTimelineAt: string;
};

export async function fetchCompaniesRecentTimelineActivity(take?: number): Promise<CompanyRecentActivity[]> {
  const sp = new URLSearchParams();
  if (take != null) sp.set("take", String(take));
  const q = sp.toString();
  return fetchJson<CompanyRecentActivity[]>(
    `/api/companies/recent-timeline-activity${q ? `?${q}` : ""}`,
  );
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
  /** Offset für Pagination (z. B. nachgeladen beim Scrollen) */
  skip?: number;
  take?: number;
}): Promise<TimelineEntry[]> {
  const sp = new URLSearchParams();
  if (params?.companyId) sp.set("companyId", params.companyId);
  if (params?.contactId) sp.set("contactId", params.contactId);
  if (params?.skip != null && params.skip > 0) sp.set("skip", String(params.skip));
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
  companyAccentColor: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  roleTitle: string | null;
};

export type SearchTimelineHit = {
  id: string;
  companyId: string;
  companyName: string;
  companyAccentColor: string | null;
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

/** Such-API: Kennfarbe Firmenzeile (`accentColor` / `AccentColor`). */
export function pickSearchHitAccentColor(hit: unknown): string | null {
  if (hit == null || typeof hit !== "object") return null;
  const o = hit as Record<string, unknown>;
  const raw = o.accentColor ?? o.AccentColor;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}

/** Such-API: Kennfarbe bei Kontakt/Ereignis (`companyAccentColor` / `CompanyAccentColor`). */
export function pickSearchCompanyAccentColor(hit: unknown): string | null {
  if (hit == null || typeof hit !== "object") return null;
  const o = hit as Record<string, unknown>;
  const raw = o.companyAccentColor ?? o.CompanyAccentColor;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
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
