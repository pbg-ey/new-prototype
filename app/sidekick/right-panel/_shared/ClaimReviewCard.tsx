import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, FileText } from "lucide-react";
import type { CitationFinding } from "../../type";
import { RiskBadge, ScoreDots } from "../../utils/ui";

export function ClaimReviewCard({ items, onOpenSlide }: { items: CitationFinding[]; onOpenSlide: () => void }) {
  return (
    <Card className="border-muted/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" /> Claim review - citations & risk
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-lg border p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{f.citation}</div>
                <div className="mt-1">
                  <ScoreDots v={f.veracity} p={f.pertinence} />
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {f.signals.map((s) => (
                    <Badge key={s} variant="secondary" className="capitalize">
                      {s.replaceAll("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              <RiskBadge risk={f.risk} />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button size="sm" variant="outline" onClick={onOpenSlide}>
          <Filter className="w-3.5 h-3.5 mr-1" /> Open structured view
        </Button>
      </CardFooter>
    </Card>
  );
}
