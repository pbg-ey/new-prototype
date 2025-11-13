'use client';

import { WorkflowAction } from "./ActionWorkflowTypes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronRight, 
  ChevronDown, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  X,
  Clock,
  RefreshCw,
  Eye,
  Edit,
  Brain
} from "lucide-react";


export default function ActionWorkflowCard({
  action,
  expanded,
  onToggleExpanded,
  onAddSource,
  onGenerate,
  onValidate,
}: {
  action: WorkflowAction;
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddSource: (actionId: string) => void;
  onGenerate: (actionId: string) => void;
  onValidate: (actionId: string) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{action.title}</h4>
          {!expanded && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {action.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1">
            {action.aiReasoning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Brain className="h-3 w-3 text-gray-400 hover:text-blue-500 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">AI Reasoning</p>
                    <p className="text-xs text-gray-600">{action.aiReasoning.reasoning}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {action.stageStatuses.validation === 'completed' && (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
            {action.stageStatuses.validation !== 'completed' && action.currentStage === 'validation' && (
              <RefreshCw className="h-3 w-3 text-blue-500 animate-pulse" />
            )}
            {action.stageStatuses.generation === 'completed' && action.stageStatuses.validation !== 'completed' && (
              <Sparkles className="h-3 w-3 text-purple-500" />
            )}
            {action.stageStatuses.sources === 'active' && (
              <Upload className="h-3 w-3 text-gray-400" />
            )}
          </div>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 px-2.5 pb-2.5">
          {/* Description */}
          <div className="py-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              {action.description}
            </p>
          </div>

          {/* Simple Stage Indicator */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-2 text-xs">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                action.currentStage === 'sources' 
                  ? 'bg-gray-100 text-gray-700'
                  : action.stageStatuses.sources === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-50 text-gray-500'
              }`}>
                <Upload className="h-3 w-3" />
                <span>Sources</span>
                {action.stageStatuses.sources === 'completed' && <CheckCircle className="h-2.5 w-2.5" />}
              </div>
              
              <ChevronRight className="h-2.5 w-2.5 text-gray-300" />
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                action.currentStage === 'generation'
                  ? 'bg-gray-100 text-gray-700'
                  : action.stageStatuses.generation === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-50 text-gray-500'
              }`}>
                <Sparkles className="h-3 w-3" />
                <span>Generate</span>
                {action.stageStatuses.generation === 'completed' && <CheckCircle className="h-2.5 w-2.5" />}
              </div>
              
              <ChevronRight className="h-2.5 w-2.5 text-gray-300" />
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                action.currentStage === 'validation'
                  ? 'bg-gray-100 text-gray-700'
                  : action.stageStatuses.validation === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-50 text-gray-500'
              }`}>
                <CheckCircle className="h-3 w-3" />
                <span>Validate</span>
                {action.stageStatuses.validation === 'completed' && <CheckCircle className="h-2.5 w-2.5" />}
              </div>
            </div>
          </div>

          {/* Stage Content */}
          {action.currentStage === 'sources' && (
            <SourcesStage action={action} onAddSource={onAddSource} onGenerate={onGenerate} />
          )}
          
          {action.currentStage === 'generation' && (
            <GenerationStage action={action} onValidate={onValidate} />
          )}
          
          {action.currentStage === 'validation' && (
            <ValidationStage action={action} />
          )}
        </div>
      )}
    </div>
  );
}

function SourcesStage({ 
  action, 
  onAddSource, 
  onGenerate 
}: { 
  action: WorkflowAction;
  onAddSource: (actionId: string) => void;
  onGenerate: (actionId: string) => void;
}) {
  const readySources = action.sources.filter(s => s.status === 'ready').length;
  const canGenerate = readySources > 0;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Sources ({action.sources.length})
        </h5>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddSource(action.id)}
          className="h-7 px-3 text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          Add Sources
        </Button>
      </div>

      {action.sources.length === 0 ? (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">No sources added yet</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddSource(action.id)}
            className="h-7 px-3 text-xs"
          >
            Upload Files
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {action.sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-3 p-2 rounded-md border border-muted/40 bg-muted/20"
            >
              <div className="shrink-0">
                {source.status === 'uploading' ? (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                ) : source.status === 'ready' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : source.status === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{source.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{source.type}</span>
                  {source.size && <span>• {source.size}</span>}
                  {source.uploadProgress !== undefined && source.uploadProgress < 100 && (
                    <span>• {Math.round(source.uploadProgress)}%</span>
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {canGenerate && (
            <div className="pt-2">
              <Button
                onClick={() => onGenerate(action.id)}
                className="w-full h-8 text-xs"
                disabled={!canGenerate}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Generate Content ({readySources} source{readySources !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GenerationStage({ 
  action, 
  onValidate 
}: { 
  action: WorkflowAction;
  onValidate: (actionId: string) => void;
}) {
  const isGenerating = action.stageStatuses.generation === 'active' && !action.generatedContent;
  
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Generated Content
      </h5>

      {isGenerating ? (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Generating analysis...</p>
              <p className="text-xs text-muted-foreground">
                Processing {action.sources.filter(s => s.status === 'ready').length} sources with AI
              </p>
            </div>
          </div>
          
          {/* Animated progress dots */}
          <div className="flex items-center gap-1 mt-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-xs text-muted-foreground ml-2">Analyzing patterns and generating insights...</span>
          </div>
        </div>
      ) : action.generatedContent ? (
        <div className="space-y-3">
          <div className="rounded-md border border-muted/40 bg-background p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground capitalize">
                  {action.generatedContent.type}
                </span>
                <Badge variant="outline" className="text-xs">
                  {action.generatedContent.wordCount} words
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(action.generatedContent.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {action.generatedContent.content}
            </p>
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-muted/20">
              <span className="text-xs text-muted-foreground">
                Generated {new Date(action.generatedContent.generatedAt).toLocaleTimeString()}
              </span>
              <Button
                size="sm"
                onClick={() => onValidate(action.id)}
                className="h-7 px-3 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Validate Content
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Ready to generate content from sources</p>
        </div>
      )}
    </div>
  );
}

function ValidationStage({ action }: { action: WorkflowAction }) {
  const isValidating = action.stageStatuses.validation === 'active' && !action.validationResults;
  
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Validation Results
      </h5>

      {isValidating ? (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Validating content...</p>
              <p className="text-xs text-muted-foreground">
                Checking accuracy, completeness, and compliance
              </p>
            </div>
          </div>
        </div>
      ) : action.validationResults ? (
        <div className="space-y-2">
          {action.validationResults.map((result) => {
            const statusColors = {
              pass: "border-green-200 bg-green-50 text-green-700",
              warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
              fail: "border-red-200 bg-red-50 text-red-700"
            };
            
            const StatusIcon = result.status === 'pass' ? CheckCircle :
                              result.status === 'warning' ? AlertCircle : X;
            
            return (
              <div 
                key={result.id}
                className={`flex items-start gap-3 p-3 rounded-md border ${statusColors[result.status]}`}
              >
                <StatusIcon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium capitalize">{result.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.severity}
                    </Badge>
                  </div>
                  <p className="text-xs">{result.message}</p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2">
            <Button className="w-full h-8 text-xs" variant="outline">
              <Brain className="h-3 w-3 mr-1" />
              Export to Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4 text-center">
          <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Ready to validate generated content</p>
        </div>
      )}
    </div>
  );
}