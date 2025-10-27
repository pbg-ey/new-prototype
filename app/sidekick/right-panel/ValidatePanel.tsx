import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";
import type { ValidationIssue } from "../type";
import { SeverityBadge } from "../utils/ui";

export function ValidatePanel({
  score,
  issues,
  selectedId,
  onSelect,
  onFix,
}: {
  score: number;
  issues: ValidationIssue[];
  selectedId?: string | null;
  onSelect: (i: ValidationIssue) => void;
  onFix: (i: ValidationIssue) => void;
}) {
  return (
    <div className="p-3 space-y-3 h-full overflow-y-auto">
      <Card className="border-muted/60">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" /> Validate - Overall Safety Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-semibold">{score}</div>
            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${score}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">Higher is safer</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Problems to fix</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2">
            {issues.map((iss) => (
              <button
                key={iss.id}
                onClick={() => onSelect(iss)}
                className={`text-left rounded border p-3 hover:bg-muted focus:outline-none ${
                  selectedId === iss.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <SeverityBadge level={iss.severity} />
                  <Badge variant="outline" className="capitalize whitespace-nowrap text-xs">
                    {iss.type.replace(/_/g, " ")}
                  </Badge>
                  <div className="text-sm font-medium flex-1 min-w-[140px] break-words">{iss.title}</div>
                  <Badge variant="outline" className="whitespace-nowrap text-xs">
                    Section: {iss.section}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground break-words">{iss.excerpt}</div>
              </button>
            ))}
          </div>
        </CardContent>
        {selectedId && (
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="text-sm font-medium">Suggested fixes</div>
            <div className="grid gap-2">
              {issues
                .find((x) => x.id === selectedId)
                ?.fixOptions.map((opt, idx) => (
                  <div key={idx} className="rounded border p-2 text-sm bg-muted/50">
                    {opt}
                  </div>
                ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onFix(issues.find((x) => x.id === selectedId)!)} disabled={!selectedId}>
                <Sparkles className="w-4 h-4 mr-1" /> Fix with AI
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
