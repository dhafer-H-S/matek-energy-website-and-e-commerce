"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { FieldShell } from "./fields";
import { FORM_LOCALES, useActiveLocale, type TranslatedValues } from "./LangFields";
import { cn } from "@/lib/utils";

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn(
      "flex h-8 w-8 items-center justify-center rounded-xs transition-colors",
      active ? "bg-gold/20 text-gold" : "text-muted hover:bg-background-alt hover:text-foreground",
    );
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background px-2 py-1.5">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Heading 2">
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} aria-label="Heading 3">
        <Heading3 className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} aria-label="Bullet list">
        <List className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} aria-label="Ordered list">
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} aria-label="Quote">
        <Quote className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} aria-label="Undo">
        <Undo className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} aria-label="Redo">
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}

function SingleEditor({
  name,
  defaultValue,
  dir = "ltr",
}: {
  name: string;
  defaultValue?: string | null;
  dir?: "ltr" | "rtl";
}) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text min-h-40 px-4 py-3 outline-none",
        dir,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-surface">
      <input type="hidden" name={name} value={html} />
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/** Non-translated rich text. */
export function RichTextField({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <SingleEditor name={name} defaultValue={defaultValue} />
    </FieldShell>
  );
}

/** Translated rich text — one editor per locale, toggled by the language tabs. */
export function TranslatedRichText({
  label,
  name,
  hint,
  values,
}: {
  label: string;
  name: string;
  hint?: string;
  values?: TranslatedValues;
}) {
  const active = useActiveLocale();
  return (
    <FieldShell label={label} hint={hint}>
      {FORM_LOCALES.map((l) => (
        <div key={l.code} className={cn(active !== l.code && "hidden")}>
          <SingleEditor
            name={`${name}_${l.code}`}
            defaultValue={values?.[l.code] ?? ""}
            dir={l.dir}
          />
        </div>
      ))}
    </FieldShell>
  );
}
