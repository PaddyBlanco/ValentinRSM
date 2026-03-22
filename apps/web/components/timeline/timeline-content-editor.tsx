"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import { inputClass } from "@/lib/form-styles";
import { legacyPlainTextToHtml, looksLikeTimelineHtml } from "@/lib/timeline-plain-text";

const extensions = [
  StarterKit.configure({
    /** Mit sanitize-timeline-html / API-Whitelist: h1–h4 — sonst gehen H1/H4 beim Einfügen verloren. */
    heading: { levels: [1, 2, 3, 4] },
    codeBlock: false,
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-[var(--fg-muted)] underline underline-offset-2 hover:text-[var(--fg)]",
    },
  }),
  Placeholder.configure({
    placeholder: "Inhalt eingeben oder aus Zwischenablage einfügen…",
  }),
];

const barBtn =
  "rounded-sm px-2 py-1 text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)] disabled:opacity-40";
const barBtnActive = "bg-[var(--hover)] text-[var(--fg)]";

function valueToEditorHtml(value: string): string {
  return !value?.trim() ? "<p></p>" : looksLikeTimelineHtml(value) ? value : legacyPlainTextToHtml(value);
}

export function TimelineContentEditor({
  value,
  onChange,
  disabled,
  /** Größere Mindesthöhe für Modale / komfortables Bearbeiten */
  large,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  large?: boolean;
}) {
  const initialHtml =
    !value?.trim() ? "<p></p>" : looksLikeTimelineHtml(value) ? value : legacyPlainTextToHtml(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialHtml,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "timeline-rich-text prose prose-sm dark:prose-invert max-w-none min-h-[120px] px-3 py-2 outline-none focus:outline-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  /** Wenn sich `value` von außen ändert (z. B. Bearbeiten lädt nach), nachziehen — Mount allein reicht nicht. */
  useEffect(() => {
    if (!editor) return;
    const next = valueToEditorHtml(value);
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={`${inputClass} flex flex-col overflow-hidden ${large ? "h-[min(52vh,440px)]" : "h-[min(36vh,300px)]"} animate-pulse bg-[var(--bg-elevated)]`}
        aria-hidden
      >
        <div className="h-9 shrink-0 border-b border-[var(--hairline)]" />
        <div className="min-h-0 flex-1" />
      </div>
    );
  }

  const ed = editor;

  function setLink() {
    const prev = ed.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link-URL (https://…)", prev ?? "https://");
    if (url === null) return;
    const t = url.trim();
    if (t === "") {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    ed.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--bg)] ${
        large ? "h-[min(52vh,440px)]" : "h-[min(36vh,300px)]"
      } ${disabled ? "opacity-70" : ""}`}
    >
      <div
        className="flex shrink-0 flex-wrap gap-0.5 border-b border-[var(--hairline)] px-1 py-1"
        role="toolbar"
        aria-label="Textformatierung"
      >
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("bold") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleBold().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("bold")}
          aria-label="Fett"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          className={`${barBtn} italic ${ed.isActive("italic") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleItalic().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("italic")}
          aria-label="Kursiv"
        >
          I
        </button>
        <button
          type="button"
          className={`${barBtn} underline ${ed.isActive("underline") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("underline")}
          aria-label="Unterstrichen"
        >
          U
        </button>
        <button
          type="button"
          className={`${barBtn} line-through ${ed.isActive("strike") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleStrike().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("strike")}
          aria-label="Durchgestrichen"
        >
          S
        </button>
        <span className="mx-0.5 w-px self-stretch bg-[var(--hairline)]" aria-hidden />
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("heading", { level: 1 }) ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          aria-label="Überschrift 1"
        >
          H1
        </button>
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("heading", { level: 2 }) ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          aria-label="Überschrift 2"
        >
          H2
        </button>
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("heading", { level: 3 }) ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          aria-label="Überschrift 3"
        >
          H3
        </button>
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("heading", { level: 4 }) ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleHeading({ level: 4 }).run()}
          disabled={disabled}
          aria-label="Überschrift 4"
        >
          H4
        </button>
        <span className="mx-0.5 w-px self-stretch bg-[var(--hairline)]" aria-hidden />
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("bulletList") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("bulletList")}
          aria-label="Aufzählung"
        >
          • Liste
        </button>
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("orderedList") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("orderedList")}
          aria-label="Nummerierte Liste"
        >
          1. Liste
        </button>
        <button
          type="button"
          className={`${barBtn} ${ed.isActive("blockquote") ? barBtnActive : ""}`}
          onClick={() => ed.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          aria-pressed={ed.isActive("blockquote")}
          aria-label="Zitat"
        >
          „…“
        </button>
        <button
          type="button"
          className={barBtn}
          onClick={() => ed.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          aria-label="Trennlinie"
        >
          —
        </button>
        <button type="button" className={`${barBtn} ${ed.isActive("link") ? barBtnActive : ""}`} onClick={setLink} disabled={disabled} aria-label="Link">
          Link
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
