import DOMPurify from "isomorphic-dompurify";

/** Muss zur API-Whitelist (TimelineHtmlSanitizer) passen. */
const SANITIZE = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "hr",
    "code",
    "pre",
    "span",
    "div",
  ] as string[],
  ALLOWED_ATTR: ["href", "target", "rel", "class"] as string[],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeTimelineHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty ?? "", SANITIZE);
}
