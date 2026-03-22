const COLLAPSE_CHARS = 280;
const COLLAPSE_LINES = 5;

/** Langer Inhalt: gekürzt mit „Mehr anzeigen“ sinnvoll. */
export function timelineContentNeedsExpand(content: string): boolean {
  const t = content.trim();
  if (t.length === 0) return false;
  if (t.length > COLLAPSE_CHARS) return true;
  return t.split(/\r?\n/).length > COLLAPSE_LINES;
}
