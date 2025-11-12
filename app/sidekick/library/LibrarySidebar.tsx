import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Link2,
  ChevronLeft,
  Plus,
  Mail,
  FileEdit,
  BookOpen,
  ExternalLink,
  PanelRightOpen,
  Table,
} from "lucide-react";
import type { SourceCategory, SourceItem, ProjectDocument } from "../type";

function SourceRow({
  s,
  onLink,
  onSelect,
  active,
}: {
  s: SourceItem;
  onLink: (s: SourceItem) => void;
  onSelect: (s: SourceItem) => void;
  active: boolean;
}) {
  const handleActivate = () => onSelect(s);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(s);
    }
  };



  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-md border px-3 py-2 text-left cursor-pointer transition-colors ${
        active ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/60"
      }`}
    >
      <div className="flex items-start gap-2">
        <FileText className="mt-1 w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-sm font-medium leading-5 break-words">{s.name}</div>
          {s.href && (
            <div className="text-[11px] text-muted-foreground break-all leading-4">
              {s.href.replace(/^https?:\/\//, "")}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {s.missing && (
              <Badge variant="destructive" className="text-[10px] uppercase tracking-wide">
                Missing
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] capitalize">
              {s.category === "prior" ? "prior work" : s.category}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onLink(s);
            }}
          >
            <Link2 className="w-4 h-4" />
          </Button>
          <div className="text-[11px] text-muted-foreground whitespace-nowrap leading-3">
            {new Date(s.addedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function highlightPreview(text: string, term?: string | null) {
  if (!term || !term.trim()) {
    return text;
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={`hl-${idx}`} className="bg-blue-200 text-blue-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const DOCUMENT_LABELS: Record<ProjectDocument["kind"], string> = {
  memo: "Memo",
  email: "Email",
  draft: "Draft",
  explanation: "Explainer",
  matrix: "Matrix",
};

function iconForDocument(kind: ProjectDocument["kind"]) {
  if (kind === "email") return <Mail className="w-4 h-4" />;
  if (kind === "draft") return <FileEdit className="w-4 h-4" />;
  if (kind === "explanation") return <BookOpen className="w-4 h-4" />;
  if (kind === "matrix") return <Table className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function DocumentRow({
  doc,
  onSelect,
  active,
}: {
  doc: ProjectDocument;
  onSelect: (doc: ProjectDocument) => void;
  active: boolean;
}) {
  const handleActivate = () => onSelect(doc);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(doc);
    }
  };
  const label = DOCUMENT_LABELS[doc.kind];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-md border px-3 py-2 cursor-pointer transition-colors ${
        active ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/60"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1 shrink-0 text-muted-foreground">{iconForDocument(doc.kind)}</div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-sm font-medium leading-5 break-words">{doc.name}</div>
          <div className="text-xs text-muted-foreground capitalize leading-4">{label}</div>
        </div>
        <div className="text-[11px] text-muted-foreground whitespace-nowrap leading-4">
          {new Date(doc.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export function LibrarySidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onUploadSource,
  onOpenInWorkspace,
  sources,
  query,
  categoryFilter,
  onQuery,
  onCategory,
  onInsertLink,
  selectedSource,
  onSelectSource,
  onClosePreview,
  sourceHighlight,
}: {
  documents: ProjectDocument[];
  activeDocumentId: string | null;
  onSelectDocument: (doc: ProjectDocument) => void;
  onCreateDocument: () => void;
  onUploadSource: () => void;
  onOpenInWorkspace: (src: SourceItem) => void;
  sources: SourceItem[];
  query: string;
  categoryFilter: "all" | SourceCategory;
  onQuery: (v: string) => void;
  onCategory: (v: "all" | SourceCategory) => void;
  onInsertLink: (src: SourceItem) => void;
  selectedSource: SourceItem | null;
  onSelectSource: (src: SourceItem) => void;
  onClosePreview: () => void;
  sourceHighlight?: string | null;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDocuments = documents.filter((doc) => {
    if (!normalizedQuery) return true;
    return doc.name.toLowerCase().includes(normalizedQuery);
  });
  const filteredSources = sources.filter((s) => {
    const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
    const matchesQuery = !normalizedQuery || s.name.toLowerCase().includes(normalizedQuery);
    return matchesCat && matchesQuery;
  });

  if (selectedSource) {
    const paragraphs = (selectedSource.preview ?? "No preview available for this source.")
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div className="w-[22rem] min-w-[22rem] max-w-[22rem] h-full flex flex-col border-r bg-background">
        <div className="px-3 py-3 border-b space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={onClosePreview} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                onOpenInWorkspace(selectedSource);
                onClosePreview();
              }}
              aria-label="Open in workspace"
            >
              <PanelRightOpen className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold leading-5 break-words">{selectedSource.name}</div>
              {selectedSource.href && (
                <div className="text-[11px] text-muted-foreground break-all leading-4">
                  {selectedSource.href.replace(/^https?:\/\//, "")}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onInsertLink(selectedSource)}
                aria-label="Cite source"
              >
                <Link2 className="w-4 h-4" />
              </Button>
              {selectedSource.href && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(selectedSource.href ?? "#", "_blank", "noopener,noreferrer")}
                  aria-label="Open source link"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-b text-[11px] text-muted-foreground flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">
            {selectedSource.category === "prior" ? "prior work" : selectedSource.category}
          </Badge>
          <span>Added {new Date(selectedSource.addedAt).toLocaleDateString()}</span>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3 text-sm leading-6">
            {paragraphs.length === 0
              ? "Upload pending. Add the source file to view excerpts."
              : paragraphs.map((para, idx) => (
                  <p key={`para-${idx}`} className="text-muted-foreground">
                    {highlightPreview(para, sourceHighlight)}
                  </p>
                ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-[22rem] min-w-[22rem] max-w-[22rem] h-full flex flex-col border-r bg-background">
      <div className="px-3 py-3 border-b">
        <Input
          placeholder="Search documents and sources..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="py-3 space-y-6 pr-1">
          <section>
            <div className="px-3 flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Documents</span>
              <Button size="sm" variant="outline" className="gap-1 whitespace-nowrap" onClick={onCreateDocument}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            <div className="px-3 pt-3 space-y-1">
              {filteredDocuments.length === 0 ? (
                <div className="text-xs text-muted-foreground">No documents yet. Add one to begin drafting.</div>
              ) : (
                filteredDocuments.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    active={doc.id === activeDocumentId}
                    onSelect={onSelectDocument}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <div className="px-3 flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Sources</span>
              <Button size="sm" variant="outline" className="gap-1 whitespace-nowrap" onClick={onUploadSource}>
                <Upload className="w-4 h-4" /> Add
              </Button>
            </div>
            <div className="px-3 pt-3 flex flex-wrap items-center gap-2">
              {(["all", "facts", "laws", "explanations", "prior"] as const).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? "default" : "outline"}
                  onClick={() => onCategory(cat)}
                  className="h-7 px-3 text-xs capitalize whitespace-nowrap"
                >
                  {cat === "prior" ? "prior work" : cat}
                </Button>
              ))}
            </div>
            <div className="px-3 pt-3">
              {filteredSources.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No sources yet. Add files to populate your library.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSources.map((s) => (
                    <SourceRow
                      key={s.id}
                      s={s}
                      onLink={onInsertLink}
                      onSelect={onSelectSource}
                      active={selectedSource?.id === s.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

