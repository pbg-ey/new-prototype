import * as React from "react";
import { insertIntoSection } from "../utils/insertIntoSelection";

export type EditorHandle = {
  insertAtSection: (sectionTitle: string, text: string) => void;
  insertAtEnd: (text: string) => void;
  highlightRange: (start: number, end: number) => void;
  replaceRange: (start: number, end: number, text: string) => void;
  insertLink: (fallbackLabel: string, href: string) => void;
};

export const SimpleEditor = React.forwardRef<EditorHandle, { value: string; onChange: (v: string) => void }>(
  ({ value, onChange }, ref) => {
    const areaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(ref, () => ({
      insertAtSection(sectionTitle: string, text: string) {
        onChange(insertIntoSection(areaRef.current?.value ?? value, sectionTitle, text));
      },
      insertAtEnd(text: string) {
        onChange((areaRef.current?.value ?? value) + (value.endsWith("\n") ? "" : "\n\n") + text + "\n");
      },
      highlightRange(start: number, end: number) {
        const el = areaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(start, end);
        const caret = end;
        el.setSelectionRange(caret, caret);
        el.setSelectionRange(start, end);
      },
      replaceRange(start: number, end: number, text: string) {
        const el = areaRef.current;
        const cur = el?.value ?? value;
        const next = cur.slice(0, start) + text + cur.slice(end);
        onChange(next);
        if (el) {
          el.focus();
          const caret = start + text.length;
          el.setSelectionRange(caret, caret);
        }
      },
      insertLink(fallbackLabel: string, href: string) {
        const el = areaRef.current;
        const cur = el?.value ?? value;
        const start = el?.selectionStart ?? cur.length;
        const end = el?.selectionEnd ?? cur.length;
        const selectedText = cur.slice(start, end);
        const label = (selectedText || fallbackLabel || href).trim() || href;
        const sanitizedHref = href.trim();
        if (!sanitizedHref) return;
        const linkMarkdown = `[${label}](${sanitizedHref})`;
        const next = cur.slice(0, start) + linkMarkdown + cur.slice(end);
        onChange(next);
        if (el) {
          el.focus();
          const caret = start + linkMarkdown.length;
          el.setSelectionRange(caret, caret);
        }
      },
    }));

    return (
      <div className="h-full flex flex-col">
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full h-full resize-none outline-none rounded-none bg-background px-4 py-3 font-mono text-sm border-r"
          spellCheck={false}
        />
      </div>
    );
  }
);
SimpleEditor.displayName = "SimpleEditor";

export const MemoSimpleEditor = React.memo(SimpleEditor);
