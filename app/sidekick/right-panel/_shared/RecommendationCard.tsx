import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, Upload } from "lucide-react";
import type { Recommendation } from "../../type";

export function RecommendationCard({ rec, onAct }: { rec: Recommendation; onAct: (rec: Recommendation) => void }) {
  return (
    <Card className="border-muted/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> {rec.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground flex flex-wrap gap-2">
        <Badge variant="outline">{rec.intent}</Badge>
        <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "med" ? "default" : "secondary"}>
          {rec.priority}
        </Badge>
        {rec.context?.section && <Badge variant="outline">Section: {rec.context.section}</Badge>}
        {rec.context?.issue && <Badge variant="outline">Issue: {rec.context.issue}</Badge>}
        {rec.context?.jurisdictions?.length ? (
          <Badge variant="outline">Jurisdiction: {rec.context.jurisdictions.join(", ")}</Badge>
        ) : null}
      </CardContent>
      <CardFooter className="pt-0 flex items-center gap-2">
        {rec.intent === "add_evidence" && (
          <Button size="sm" onClick={() => onAct(rec)}>
            <Upload className="w-3.5 h-3.5 mr-1" /> Add evidence
          </Button>
        )}
        {rec.intent === "draft" && (
          <Button size="sm" variant="secondary" onClick={() => onAct(rec)}>
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Draft now
          </Button>
        )}
        {rec.intent === "re_score" && (
          <Button size="sm" variant="outline" onClick={() => onAct(rec)}>
            Re-score
          </Button>
        )}
        <div className="ml-auto text-[11px] text-muted-foreground">Status: {rec.status}</div>
      </CardFooter>
    </Card>
  );
}
