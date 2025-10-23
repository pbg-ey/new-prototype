import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload } from "lucide-react";

export function UploadPromptCard({ onPick }: { onPick: () => void }) {
  return (
    <Card className="border-dashed border-muted/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload supporting document
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        Add a PDF/Word file. We will extract citables, save to the Library, and re-analyze.
      </CardContent>
      <CardFooter className="pt-0">
        <Button onClick={onPick}>
          <Paperclip className="w-4 h-4 mr-1" /> Upload document
        </Button>
      </CardFooter>
    </Card>
  );
}
