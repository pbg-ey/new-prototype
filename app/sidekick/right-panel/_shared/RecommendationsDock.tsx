import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import type { Recommendation } from "../../type";

export function RecommendationsDock({ items, onAct }: { items: Recommendation[]; onAct: (rec: Recommendation) => void }) {
  const top = items.filter((r) => r.status !== "closed").slice(0, 3);
  if (top.length === 0) {
    return null;
  }
  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {top.map((r) => (
            <Button key={r.id} size="sm" variant="secondary" className="h-7" onClick={() => onAct(r)}>
              <Lightbulb className="w-3.5 h-3.5 mr-1" /> {r.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
