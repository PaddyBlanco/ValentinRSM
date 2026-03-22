/** ISO-String → Wert für input[type=datetime-local] (lokale Zeit) */
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(local: string): string {
  return new Date(local).toISOString();
}

export function nowDatetimeLocal(): string {
  return isoToDatetimeLocal(new Date().toISOString());
}
