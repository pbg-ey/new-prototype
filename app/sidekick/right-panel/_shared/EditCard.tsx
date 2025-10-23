import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function EditCard({ text, onInsert }: { text: string; onInsert: () => void }) {
  return (
    <Card className="relative border-muted/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Proposed edit
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{text}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Review then add to document.</div>
      </CardFooter>
      <Button
        size="icon"
        className="absolute bottom-3 right-3 h-7 w-7 rounded-full"
        onClick={onInsert}
        aria-label="Add to document"
        title="Add to document"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </Card>
  );
}
