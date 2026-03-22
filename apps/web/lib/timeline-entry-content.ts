import { looksLikeTimelineHtml, timelinePlainTextFromContent } from "@/lib/timeline-plain-text";

const COLLAPSE_CHARS = 280;
const COLLAPSE_LINES = 5;

/** Langer Inhalt: gekürzt mit „Mehr anzeigen“ sinnvoll. */
export function timelineContentNeedsExpand(content: string): boolean {
  const t = timelinePlainTextFromContent(content);
  if (t.length === 0) return false;
  if (t.length > COLLAPSE_CHARS) return true;
  if (looksLikeTimelineHtml(content)) return false;
  return t.split(/\r?\n/).length > COLLAPSE_LINES;
}
