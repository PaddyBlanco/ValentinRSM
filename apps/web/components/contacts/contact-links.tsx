import type { ReactNode } from "react";

/** href für mailto: (Sonderzeichen im lokalen Teil) */
export function mailtoHref(email: string): string {
  return `mailto:${encodeURIComponent(email.trim())}`;
}

/** href für tel: — Leerzeichen entfernen, Anzeige bleibt unverändert */
export function telHref(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");
  return `tel:${cleaned}`;
}

export function MailtoLink({
  email,
  className,
  children,
}: {
  email: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={mailtoHref(email)} className={className ?? "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"}>
      {children ?? email}
    </a>
  );
}

export function TelLink({
  phone,
  className,
  children,
}: {
  phone: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={telHref(phone)} className={className ?? "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"}>
      {children ?? phone}
    </a>
  );
}
