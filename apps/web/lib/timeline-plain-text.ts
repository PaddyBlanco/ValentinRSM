import { sanitizeTimelineHtml } from "@/lib/sanitize-timeline-html";

function escapeHtmlText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Alte Einträge ohne Tags → HTML für den Editor. */
export function legacyPlainTextToHtml(s: string): string {
  const t = s ?? "";
  if (!t.trim()) return "<p></p>";
  const parts = t.replace(/\r\n/g, "\n").split("\n");
  return parts.map((p) => `<p>${p.length ? escapeHtmlText(p) : "<br>"}</p>`).join("");
}

/** Heuristik: alter Plain-Text vs. gespeichertes HTML. */
export function looksLikeTimelineHtml(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return false;
  return /<[a-z/!]/i.test(t);
}

/** Sichtbarer Text (Länge/Klapp-Logik), ohne Tags. */
export function timelinePlainTextFromContent(content: string): string {
  const safe = sanitizeTimelineHtml(content);
  if (!looksLikeTimelineHtml(content)) {
    return content.trim();
  }
  const noTags = safe.replace(/<[^>]+>/g, " ");
  return noTags.replace(/\s+/g, " ").trim();
}
