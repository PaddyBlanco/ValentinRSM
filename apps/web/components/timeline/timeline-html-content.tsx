"use client";

import { useMemo } from "react";
import { sanitizeTimelineHtml } from "@/lib/sanitize-timeline-html";
import { legacyPlainTextToHtml, looksLikeTimelineHtml } from "@/lib/timeline-plain-text";

type Props = {
  content: string;
  className?: string;
};

/**
 * Timeline-Inhalt: gespeichertes HTML (sanitized + prose) oder Legacy-Plain-Text
 * (wird wie im Editor in Absätze überführt, damit die Darstellung formatiert ist).
 */
export function TimelineHtmlContent({ content, className = "" }: Props) {
  const html = useMemo(() => {
    if (!content.trim()) return null;
    const source = looksLikeTimelineHtml(content) ? content : legacyPlainTextToHtml(content);
    return sanitizeTimelineHtml(source);
  }, [content]);

  if (html === null) {
    return null;
  }

  return (
    <div
      className={`timeline-html-content timeline-rich-text prose prose-sm max-w-none text-sm leading-relaxed text-[var(--fg)] dark:prose-invert [&_a]:text-[var(--fg-muted)] [&_a]:underline ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
