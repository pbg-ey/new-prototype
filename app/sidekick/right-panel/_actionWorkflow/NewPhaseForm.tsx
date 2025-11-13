import * as React from "react";
import { Button } from "@/components/ui/button";

interface NewPhaseFormProps {
  name: string;
  description: string;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

export function NewPhaseForm({
  name,
  description,
  onChangeName,
  onChangeDescription,
  onCancel,
  onSubmit,
  canSubmit,
  nameInputRef,
}: NewPhaseFormProps) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-4 rounded-xl border border-dashed border-gray-300 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Create a new workflow phase</h3>
        <p className="mt-1 text-xs text-gray-500">
          Define the section details for this workflow stage.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            Phase name
            <span className="text-gray-400 normal-case">required</span>
          </label>
          <input
            ref={nameInputRef}
            value={name}
            onChange={(event) => onChangeName(event.target.value)}
            placeholder="e.g. Risk Assessment"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => onChangeDescription(event.target.value)}
            placeholder="Describe the purpose of this phase"
            rows={3}
            className="mt-1 w-full resize-none rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-left text-xs text-gray-500">
        <p className="font-medium text-gray-700">Next steps</p>
        <p className="leading-relaxed">
          Once this phase is created, it will appear at the end of your carousel.
          Select it later to add detailed actions just like other phases.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7 px-3 text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="h-7 px-3 text-xs"
        >
          Create phase
        </Button>
      </div>
    </div>
  );
}
