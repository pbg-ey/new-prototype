'use client';

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export type EditorHandle = {
  insertAtSection: (sectionTitle: string, text: string) => void;
  insertAtEnd: (text: string) => void;
  insertLink: (fallbackLabel: string, href: string) => void;
  highlightText: (fragment: string) => boolean;
  replaceText: (target: string, replacement: string) => void;
  getPlainText: () => string;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleHeading: (level: 1 | 2 | 3) => void;
  toggleBulletList: () => void;
};

const INLINE_BOLD = /\*\*(.+?)\*\*/g;
const INLINE_ITALIC = /\*(.+?)\*/g;
const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textToParagraphs(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "<p></p>";
  return trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const html = escapeHtml(line)
        .replace(INLINE_BOLD, "<strong>$1</strong>")
        .replace(INLINE_ITALIC, "<em>$1</em>")
        .replace(URL_PATTERN, '<a href="$1">$1</a>');
      return `<p>${html}</p>`;
    })
    .join("");
}

function sectionInsertionPos(editor: ReturnType<typeof useEditor>, sectionTitle: string) {
  if (!editor) return 0;
  const target = sectionTitle.trim().toLowerCase();
  if (!target) return editor.state.doc.content.size;
  let position = editor.state.doc.content.size;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading" && node.attrs.level === 1) {
      if (node.textContent.trim().toLowerCase() === target) {
        position = pos + node.nodeSize;
        return false;
      }
    }
    return true;
  });
  return position;
}

function normalizeForMatch(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function findTextRange(editor: ReturnType<typeof useEditor>, fragment: string) {
  if (!editor) return null;
  const target = normalizeForMatch(fragment);
  if (!target) return null;

  const chars: string[] = [];
  const positions: number[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text ?? "";
      for (let i = 0; i < text.length; i += 1) {
        chars.push(text[i]);
        positions.push(pos + i);
      }
    } else if (node.isBlock && chars.length) {
      chars.push("\n");
      positions.push(pos);
    }
    return true;
  });

  if (!chars.length) return null;

  const normalizedChars: string[] = [];
  const normalizedPositions: number[] = [];
  let lastWasSpace = true;

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const pos = positions[i];
    if (/\s/.test(ch)) {
      if (lastWasSpace) continue;
      normalizedChars.push(" ");
      normalizedPositions.push(pos);
      lastWasSpace = true;
    } else {
      normalizedChars.push(ch.toLowerCase());
      normalizedPositions.push(pos);
      lastWasSpace = false;
    }
  }

  while (normalizedChars.length && normalizedChars[normalizedChars.length - 1] === " ") {
    normalizedChars.pop();
    normalizedPositions.pop();
  }

  if (!normalizedChars.length) return null;

  const normalizedDoc = normalizedChars.join("");
  const matchIndex = normalizedDoc.indexOf(target);
  if (matchIndex === -1) return null;

  const startPos = normalizedPositions[matchIndex];
  const endIndex = matchIndex + target.length - 1;
  const endPos = normalizedPositions[endIndex] + 1;

  return { from: startPos, to: endPos };
}

function getFootnoteState(html: string) {
  const parser = new window.DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  const map = new Map<string, number>();
  let max = 0;
  const list = dom.querySelector("ol.footnotes");
  if (list) {
    list.querySelectorAll("li").forEach((item, index) => {
      const anchor = item.querySelector("a[href]");
      const href = anchor?.getAttribute("href") ?? "";
      if (href && !href.startsWith("#")) {
        const number = Number(item.getAttribute("data-footnote-number")) || index + 1;
        map.set(href, number);
        max = Math.max(max, number);
        item.setAttribute("data-footnote-number", number.toString());
      }
    });
  }
  return { dom, list, map, max };
}

function ensureFootnoteSection(dom: Document) {
  let section = dom.querySelector("section[data-footnotes=\"wrapper\"]");
  if (!section) {
    section = dom.createElement("section");
    section.setAttribute("data-footnotes", "wrapper");
    const heading = dom.createElement("h1");
    heading.textContent = "Source Notes";
    const list = dom.createElement("ol");
    list.className = "footnotes";
    section.appendChild(heading);
    section.appendChild(list);
    dom.body.appendChild(section);
    return list;
  }
  let list = section.querySelector("ol.footnotes");
  if (!list) {
    list = dom.createElement("ol");
    list.className = "footnotes";
    section.appendChild(list);
  }
  return list;
}

export const SimpleEditor = React.forwardRef<EditorHandle, { value: string; onChange: (next: string) => void }>(
  ({ value, onChange }, ref) => {
    const editor = useEditor(
      {
        extensions: [
          StarterKit.configure({
            heading: { levels: [1, 2, 3] },
          }),
          Link.configure({
            openOnClick: false,
            autolink: true,
            protocols: ["http", "https"],
          }),
        ],
        content: "",
        immediatelyRender: false,
        onUpdate({ editor: instance }) {
          onChange(instance.getHTML());
        },
      },
      []
    );

    React.useEffect(() => {
      if (!editor) return;
      if (value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
      }
    }, [editor, value]);

    const highlightText = React.useCallback(
      (fragment: string) => {
        if (!editor) return;
        const range = findTextRange(editor, fragment);
        if (!range) return false;
        editor.chain().focus().setTextSelection(range).scrollIntoView().run();
        return true;
      },
      [editor]
    );

    const replaceText = React.useCallback(
      (target: string, replacement: string) => {
        if (!editor) return;
        const range = findTextRange(editor, target);
        if (!range) return;
        editor.chain().focus().setTextSelection(range).insertContent(textToParagraphs(replacement)).run();
      },
      [editor]
    );

    const insertLink = React.useCallback(
      (fallbackLabel: string, href: string) => {
        if (!editor) return;
        const url = href.trim();
        if (!url) return;
        const label = fallbackLabel.trim() || url;

        const { map, max } = getFootnoteState(editor.getHTML());
        const existingNumber = map.get(url);
        const nextNumber = existingNumber ?? max + 1;
        const footnoteRef = `<span class="footnote-ref" data-footnote="${nextNumber}" id="fnref-${nextNumber}"><a href="#fn-${nextNumber}">[${nextNumber}]</a></span>`;

        editor.chain().focus().insertContent(footnoteRef).run();

        if (existingNumber !== undefined) {
          return;
        }

        const htmlAfterInsert = editor.getHTML();
        const { dom, list } = getFootnoteState(htmlAfterInsert);
        const targetList = list ?? ensureFootnoteSection(dom);

        const li = dom.createElement("li");
        li.id = `fn-${nextNumber}`;
        li.setAttribute("data-footnote-number", String(nextNumber));

        const anchor = dom.createElement("a");
        anchor.href = url;
        anchor.textContent = label;
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
        li.appendChild(anchor);

        targetList.appendChild(li);

        editor.commands.setContent(dom.body.innerHTML, false);
        editor.commands.focus("end");
      },
      [editor]
    );

    const insertAtSection = React.useCallback(
      (sectionTitle: string, text: string) => {
        if (!editor) return;
        const html = textToParagraphs(text);
        const pos = sectionInsertionPos(editor, sectionTitle);
        editor.chain().focus().insertContentAt(pos, html, { parseOptions: { preserveWhitespace: true } }).run();
      },
      [editor]
    );

    const insertAtEnd = React.useCallback(
      (text: string) => {
        if (!editor) return;
        editor.chain().focus("end").insertContent(textToParagraphs(text)).run();
      },
      [editor]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        insertAtSection,
        insertAtEnd,
        insertLink,
        highlightText,
        replaceText,
        getPlainText() {
          return editor?.getText() ?? "";
        },
        toggleBold() {
          editor?.chain().focus().toggleBold().run();
        },
        toggleItalic() {
          editor?.chain().focus().toggleItalic().run();
        },
        toggleHeading(level) {
          editor?.chain().focus().toggleHeading({ level }).run();
        },
        toggleBulletList() {
          editor?.chain().focus().toggleBulletList().run();
        },
      }),
      [editor, highlightText, insertAtEnd, insertAtSection, insertLink, replaceText]
    );

    if (!editor) {
      return <div className="flex-1 border-r px-4 py-3 text-sm text-muted-foreground">Loading editor...</div>;
    }

    return (
      <div className="h-full flex flex-col">
        <EditorContent
          editor={editor}
          className="sidekick-editor flex-1 w-full h-full overflow-auto px-4 py-3 text-sm leading-6 focus:outline-none border-r"
        />
      </div>
    );
  }
);
SimpleEditor.displayName = "SimpleEditor";

const MemoSimpleEditor = React.memo(SimpleEditor);

export default MemoSimpleEditor;
export { MemoSimpleEditor };
