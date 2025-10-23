import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "../type";

export function AllActionsPanel({
  items,
  onAct,
  onDismiss,
}: {
  items: Recommendation[];
  onAct: (r: Recommendation) => void;
  onDismiss: (id: string) => void;
}) {
  const groups = {
    high: items.filter((i) => i.priority === "high" && i.status !== "closed"),
    med: items.filter((i) => i.priority === "med" && i.status !== "closed"),
    low: items.filter((i) => i.priority === "low" && i.status !== "closed"),
  } as const;

  return (
    <div className="p-3 space-y-4 w-full min-w-0">
      {(["high", "med", "low"] as const).map((prio) => (
        <div key={prio} className="w-full min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Priority: {prio}</div>
          <div className="grid gap-2">
            {groups[prio].length === 0 && <div className="text-xs text-muted-foreground">No {prio} priority actions</div>}
            {groups[prio].map((r) => (
              <div key={r.id} className="flex items-center gap-2 w-full min-w-0">
                <Badge className="shrink-0" variant={prio === "high" ? "destructive" : prio === "med" ? "default" : "secondary"}>
                  {prio}
                </Badge>
                <div className="text-sm flex-1 min-w-0 truncate">{r.title}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => onAct(r)}>
                    Open
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDismiss(r.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
