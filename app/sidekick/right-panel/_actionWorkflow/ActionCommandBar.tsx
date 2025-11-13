import * as React from "react";
import { Brain, Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AttachmentPreview {
  id: string;
  name: string;
  size: string;
}

interface ActionCommandBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAttach?: (files: File[]) => void;
  onToggleInsights: () => void;
  insightsOpen: boolean;
  attachments?: AttachmentPreview[];
  onRemoveAttachment?: (attachmentId: string) => void;
}

export function ActionCommandBar({
  value,
  onChange,
  onSubmit,
  onAttach,
  onToggleInsights,
  insightsOpen,
  attachments,
  onRemoveAttachment,
}: ActionCommandBarProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = React.useCallback(() => {
    if (value.trim()) {
      onSubmit();
    }
  }, [onSubmit, value]);

  const handleAddFiles = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (files && files.length > 0) {
        onAttach?.(Array.from(files));
        event.target.value = "";
      }
    },
    [onAttach]
  );

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <div className="border-t bg-white p-2">
      {/* Compact single row with everything */}
      <div className="space-y-2">
        {/* Attachments (if any) - clean, no borders */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="group inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              >
                <span className="max-w-20 truncate">{attachment.name}</span>
                <span className="text-blue-500/70">{attachment.size}</span>
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="ml-0.5 flex h-3 w-3 items-center justify-center rounded-full hover:bg-blue-200"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X className="h-2 w-2" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input row with integrated controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddFiles}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Add files"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </Button>
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Create action..."
              className="w-full resize-none border-0 bg-muted/30 rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500/30"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleInsights}
            className={`h-8 w-8 p-0 ${
              insightsOpen
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={insightsOpen ? "Hide AI insights" : "Show AI insights"}
          >
            <Brain className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            disabled={!value.trim()}
            onClick={handleSubmit}
            className="h-8 px-3 text-xs"
          >
            Add
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
      />
    </div>
  );
}
