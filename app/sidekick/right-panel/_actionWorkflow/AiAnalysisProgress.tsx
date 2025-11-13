'use client';

import * as React from "react";
import { Brain, RefreshCw } from "lucide-react";
import { AiAnalysisState } from "./ActionWorkflowTypes";

interface AiAnalysisProgressProps {
  analysisState: AiAnalysisState | null;
}

export function AiAnalysisProgress({ analysisState }: AiAnalysisProgressProps) {
  if (!analysisState || !analysisState.isAnalyzing) {
    return null;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Brain className="h-4 w-4 text-blue-600" />
          <RefreshCw className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-spin text-blue-500" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-900">
              10X.ai is analyzing your workflow
            </span>
            <span className="text-xs text-blue-600">
              {Math.round(analysisState.progress)}%
            </span>
          </div>
          
          <div className="w-full bg-blue-100 rounded-full h-1.5 mb-2">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${analysisState.progress}%` }}
            />
          </div>
          
          <div className="text-xs text-blue-700">
            {analysisState.currentStep}
          </div>
        </div>
      </div>
    </div>
  );
}