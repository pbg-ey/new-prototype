import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Link2 } from "lucide-react";
import type { SourceCategory, SourceItem } from "../type";

function SourceRow({ s, onLink }: { s: SourceItem; onLink: (s: SourceItem) => void }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/80">
      <FileText className="w-4 h-4" />
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{s.name}</div>
        {s.href && (
          <div className="truncate text-[11px] text-muted-foreground">
            {s.href.replace(/^https?:\/\//, "")}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {s.missing && (
          <Badge variant="destructive" className="text-[10px] uppercase tracking-wide">
            Missing
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] capitalize">
          {s.category === "prior" ? "prior work" : s.category}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => onLink(s)}
        >
          <Link2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="text-[11px] text-muted-foreground w-16 text-right">{new Date(s.addedAt).toLocaleDateString()}</div>
    </div>
  );
}

export function LibrarySidebar({
  sources,
  query,
  categoryFilter,
  onQuery,
  onCategory,
  onPickFile,
}: {
  sources: SourceItem[];
  query: string;
  categoryFilter: "all" | SourceCategory;
  onQuery: (v: string) => void;
  onCategory: (v: "all" | SourceCategory) => void;
  onPickFile: () => void;
  onInsertLink: (src: SourceItem) => void;
}) {
  const filtered = sources.filter((s) => {
    const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
    const matchesQuery = !query.trim() || s.name.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="w-72 min-w-[18rem] max-w-[18rem] h-full flex flex-col border-r bg-background">
      <div className="px-3 py-3 border-b flex items-center gap-2">
        <Input placeholder="Search library..." value={query} onChange={(e) => onQuery(e.target.value)} className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onPickFile} aria-label="Upload source">
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add source</TooltipContent>
        </Tooltip>
      </div>

      <div className="px-3 py-2 border-b flex flex-wrap items-center gap-2 text-xs">
        {(["all", "facts", "laws", "explanations", "prior"] as const).map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? "default" : "outline"}
            onClick={() => onCategory(cat)}
            className="h-7 px-2 text-xs capitalize whitespace-nowrap"
          >
            {cat === "prior" ? "prior work" : cat}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 p-2">
        {filtered.length === 0 && (
          <div className="text-xs text-muted-foreground px-2">No sources yet. Add files to populate your library.</div>
        )}
        <div className="space-y-1">
          {filtered.map((s) => (
            <SourceRow key={s.id} s={s} onLink={onInsertLink} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

