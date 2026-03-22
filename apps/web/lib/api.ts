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
  contactId: string;
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

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl().replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
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
