// WYSIWYG editor backed by Markdown.
//
// Why a custom wrapper (rather than tiptap-markdown):
//   - TipTap v3 changed extension APIs and tiptap-markdown isn't
//     v3-ready as of writing.
//   - We only need plain CommonMark (h1/h2/h3, bold, italic, lists,
//     blockquote, links). Wiring marked + turndown directly gives
//     us full control over the round-trip and zero extra ProseMirror
//     plugins to maintain.
//
// Data flow:
//
//   Markdown (prop)
//        │ marked.parse()
//        ▼
//      HTML  ─────────►  TipTap (ProseMirror)
//                              │
//                              │ editor.getHTML()
//                              ▼
//                            HTML
//                              │ turndown
//                              ▼
//                          Markdown  ─────►  onChange()
//
// The `content` prop is treated as the source of truth — when it
// changes from outside (e.g. the AI-translation toggle), we re-parse
// it and reset the editor.

import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";
import TurndownService from "turndown";

import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownEditorProps {
  /** Markdown source. Treated as the source of truth. */
  content: string;
  /** Called with the latest Markdown whenever the user edits. */
  onChange: (markdown: string) => void;
  language?: "fr" | "ar";
  placeholder?: string;
  className?: string;
}

// Singleton turndown — configured once for the whole app.
const turndown = new TurndownService({
  headingStyle: "atx",       // # H1, ## H2, ### H3
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
});

// marked: GitHub-flavoured, hard line breaks preserved (Arabic legal
// texts often rely on explicit line breaks).
marked.setOptions({ gfm: true, breaks: true });

function mdToHtml(md: string): string {
  if (!md) return "";
  // Defensive: marked.parse can return a Promise if async extensions
  // are configured. We don't use any, so it's always a string here.
  return marked.parse(md) as string;
}

function htmlToMd(html: string): string {
  if (!html) return "";
  return turndown.turndown(html).trim();
}

const ToolbarButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ active, onClick, title, children }) => (
  <Button
    type="button"
    variant={active ? "secondary" : "ghost"}
    size="sm"
    title={title}
    onClick={onClick}
    className="h-8 w-8 p-0"
  >
    {children}
  </Button>
);

const Toolbar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1 bg-muted/40">
      <ToolbarButton
        title="Annuler"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Rétablir"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        title="Titre 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Titre 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Titre 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        title="Gras"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italique"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        title="Liste à puces"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Liste numérotée"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Citation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  language = "fr",
  placeholder = "Commencez à écrire…",
  className = "",
}) => {
  const isRTL = language === "ar";
  // Track the last-emitted markdown so we don't bounce updates from
  // our own onChange back into setContent and trash the selection.
  const lastEmittedRef = useRef<string>("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: mdToHtml(content),
    editorProps: {
      attributes: {
        dir: isRTL ? "rtl" : "ltr",
        class:
          "prose prose-sm max-w-none min-h-[400px] px-4 py-3 focus:outline-none " +
          "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 " +
          "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 " +
          "[&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2 " +
          "[&_p]:mb-2 [&_p]:leading-relaxed " +
          "[&_ul]:list-disc [&_ul]:pl-6 " +
          "[&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-3 [&_blockquote]:italic",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const md = htmlToMd(editor.getHTML());
      lastEmittedRef.current = md;
      onChange(md);
    },
  });

  // Reset editor when `content` changes externally (e.g. switching
  // language to view the translation). Skip if the new content is
  // what we just emitted — that's our own change coming back.
  useEffect(() => {
    if (!editor) return;
    if (content === lastEmittedRef.current) return;
    const html = mdToHtml(content);
    editor.commands.setContent(html, { emitUpdate: false });
  }, [content, editor]);

  // Update direction when language flips.
  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [editor, isRTL]);

  return (
    <div className={`rounded-md border bg-background ${className}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default MarkdownEditor;

// ───────── exported helpers (reused by display + migration) ─────────
export { mdToHtml, htmlToMd };
