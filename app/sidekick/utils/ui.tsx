import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const pct = (n: number) => Math.round(n * 100);

export function RiskBadge({ risk }: { risk: number }) {
  let tone: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (risk >= 0.66) tone = "destructive";
  else if (risk >= 0.33) tone = "default";
  return <Badge variant={tone}>Risk {pct(risk)}%</Badge>;
}

export function ScoreDots({ v, p }: { v: number; p: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div>Veracity {pct(v)}%</div>
      <Separator orientation="vertical" className="h-4" />
      <div>Pertinence {pct(p)}%</div>
    </div>
  );
}

export function SeverityBadge({ level }: { level: "high" | "med" | "low" }) {
  const variant = level === "high" ? "destructive" : level === "med" ? "default" : "secondary";
  return <Badge variant={variant}>{level}</Badge>;
}

export function useAutoScroll(
  trigger: unknown,
  enabled: boolean,
  el: React.RefObject<HTMLDivElement | null>
) {
  React.useEffect(() => {
    if (!enabled) return;
    el.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [trigger, enabled, el]);
}
