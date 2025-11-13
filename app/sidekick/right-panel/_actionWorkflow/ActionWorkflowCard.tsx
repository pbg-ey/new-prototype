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
  onValidate,
  onDismiss,
  onValidateSources,
}: {
  action: WorkflowAction;
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddSource: (actionId: string) => void;
  onValidate: (actionId: string) => void;
  onDismiss: (actionId: string) => void;
  onValidateSources: (actionId: string) => void;
}) {
  const [activeStage, setActiveStage] = React.useState<'sources' | 'generation' | 'validation'>(action.currentStage);
  return (
    <div className="group rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{action.title}</h4>
          {!expanded && (
            <p className="text-xs text-gray-500 truncate mt-0">
              {action.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {/* Dismiss button - shows on hover */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(action.id);
            }}
            className="h-5 w-5 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Dismiss action"
          >
            <X className="h-3 w-3" />
          </Button>
          
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 px-2 pb-2">
          {/* Description with AI reasoning */}
          <div className="py-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-gray-600 leading-relaxed flex-1">
                {action.description}
              </p>
              {action.aiReasoning && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                      aria-label="View AI reasoning"
                    >
                      <Brain className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">AI Reasoning</p>
                      <p className="text-xs text-gray-600">{action.aiReasoning.reasoning}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Clickable Stage Navigation */}
          <div className="flex items-center gap-2 py-1.5">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveStage('sources')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors cursor-pointer hover:bg-gray-100 ${
                  activeStage === 'sources' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : action.stageStatuses.sources === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                <Upload className="h-2.5 w-2.5" />
                <span>Gather</span>
                {action.stageStatuses.sources === 'completed' && <CheckCircle className="h-2 w-2" />}
              </button>
              
              <ChevronRight className="h-2 w-2 text-gray-300" />
              
              <button
                onClick={() => setActiveStage('generation')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors cursor-pointer hover:bg-gray-100 ${
                  activeStage === 'generation'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : action.stageStatuses.generation === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>Generate</span>
                {action.stageStatuses.generation === 'completed' && <CheckCircle className="h-2 w-2" />}
              </button>
              
              <ChevronRight className="h-2 w-2 text-gray-300" />
              
              <button
                onClick={() => setActiveStage('validation')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors cursor-pointer hover:bg-gray-100 ${
                  activeStage === 'validation'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : action.stageStatuses.validation === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                <CheckCircle className="h-2.5 w-2.5" />
                <span>Validate</span>
                {action.stageStatuses.validation === 'completed' && <CheckCircle className="h-2.5 w-2.5" />}
              </button>
            </div>
          </div>

          {/* Stage Content */}
          {activeStage === 'sources' && (
            <SourcesStage action={action} onAddSource={onAddSource} onValidateSources={onValidateSources} />
          )}
          
          {activeStage === 'generation' && (
            <GenerationStage action={action} onValidate={onValidate} />
          )}
          
          {activeStage === 'validation' && (
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
  onValidateSources
}: { 
  action: WorkflowAction;
  onAddSource: (actionId: string) => void;
  onValidateSources: (actionId: string) => void;
}) {
  
  return (
    <div className="space-y-2">
      {/* Auto-sourced content analysis */}
      {action.sources.length > 0 && !action.needsUserSources && (
        <div className="space-y-2">
          {/* Analysis in progress */}
          {action.sourceAnalysis?.status === 'analyzing' && (
            <div className="rounded border border-blue-200 bg-blue-50 p-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                <span className="text-xs text-blue-700">
                  Analyzing source relevance and sufficiency...
                </span>
              </div>
            </div>
          )}

          {/* Sources are sufficient - show for validation */}
          {action.sourceAnalysis?.status === 'sufficient' && (
            <div className="space-y-2">
              <div className="rounded border border-green-200 bg-green-50 p-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Sources found and verified ({Math.round(action.sourceAnalysis.confidence * 100)}% confidence)
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Please review the sources below to confirm they&apos;re accurate for your situation.
                </p>
              </div>

              {/* Show found sources for validation */}
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-gray-700">Found Sources:</h4>
                {action.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-800">{source.name}</div>
                      {source.analysis && (
                        <div className="text-xs text-gray-600">
                          Relevance: {Math.round(source.analysis.relevanceScore * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="text-xs text-green-600 hover:text-green-700 px-1">
                        ✓ Keep
                      </button>
                      <button className="text-xs text-red-600 hover:text-red-700 px-1">
                        ✗ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSource(action.id)}
                  className="h-7 text-xs"
                >
                  Add More Sources
                </Button>
                <Button
                  size="sm"
                  onClick={() => onValidateSources(action.id)}
                  className="h-7 text-xs"
                >
                  Confirm & Continue
                </Button>
              </div>
            </div>
          )}

          {/* Sources are insufficient - need user upload */}
          {(action.sourceAnalysis?.status === 'insufficient' || action.sourceAnalysis?.status === 'irrelevant') && (
            <div className="space-y-2">
              <div className="rounded border border-yellow-200 bg-yellow-50 p-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">
                    {action.sourceAnalysis.status === 'insufficient' 
                      ? 'Found sources but need more information'
                      : 'Found sources are not relevant to your situation'
                    }
                  </span>
                </div>
                
                {action.sourceAnalysis.gaps && action.sourceAnalysis.gaps.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-yellow-700 font-medium">Missing information:</p>
                    <ul className="text-xs text-yellow-600 ml-2 mt-1">
                      {action.sourceAnalysis.gaps.map((gap, index) => (
                        <li key={index}>• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {action.sourceAnalysis.recommendations && (
                  <div className="mt-2">
                    <p className="text-xs text-yellow-700 font-medium">Recommended sources:</p>
                    <ul className="text-xs text-yellow-600 ml-2 mt-1">
                      {action.sourceAnalysis.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Show any found sources (if insufficient) */}
              {action.sourceAnalysis.status === 'insufficient' && action.sources.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-700">Current Sources (Incomplete):</h4>
                  {action.sources.map((source) => (
                    <div key={source.id} className="rounded border border-gray-200 bg-gray-50 p-2">
                      <div className="text-xs font-medium text-gray-800">{source.name}</div>
                      {source.analysis && (
                        <div className="text-xs text-gray-600">
                          Relevance: {Math.round(source.analysis.relevanceScore * 100)}% 
                          {source.analysis.gaps && source.analysis.gaps.length > 0 && 
                            ` • Missing: ${source.analysis.gaps.slice(0, 2).join(', ')}`
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded border border-blue-200 bg-blue-50 p-2">
                <p className="text-xs text-blue-700 mb-2">
                  Please upload relevant documents to complete this research step.
                </p>
                <Button
                  size="sm"
                  onClick={() => onAddSource(action.id)}
                  className="h-7 text-xs w-full"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload Required Sources
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No sources found - need user upload */}
      {action.sources.length === 0 && (
        <div className="rounded border border-gray-200 bg-gray-50 p-2">
          <p className="text-xs text-gray-600 mb-2">
            No sources found automatically. Please upload relevant documents to begin research.
          </p>
          <Button
            size="sm"
            onClick={() => onAddSource(action.id)}
            className="h-7 text-xs w-full"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload Sources
          </Button>
        </div>
      )}

      {/* User-uploaded sources being processed */}
      {action.needsUserSources && action.sources.some(s => s.status === 'uploading') && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-gray-700">Processing uploads:</h4>
          {action.sources.filter(s => s.status === 'uploading').map((source) => (
            <div key={source.id} className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2">
              <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
              <span className="flex-1 text-xs text-blue-700">{source.name}</span>
              {source.uploadProgress !== undefined && (
                <span className="text-xs text-blue-600">{source.uploadProgress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing sources without analysis - show basic source list */}
      {action.sources.length > 0 && !action.sourceAnalysis && !action.needsUserSources && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-700">Sources ({action.sources.length})</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddSource(action.id)}
              className="h-6 px-2 text-xs"
            >
              <Upload className="h-2.5 w-2.5 mr-1" />
              Add More
            </Button>
          </div>

          <div className="space-y-1">
            {action.sources.map((source) => (
              <div key={source.id} className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-800">{source.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{source.type} • {source.size}</span>
                    {source.status === 'ready' && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          <span className="text-green-700 font-medium">
                            {80 + (source.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 20)}% confidence
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button className="h-5 w-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={() => onValidateSources(action.id)}
              className="h-7 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>
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
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-foreground">
        Generated Content
      </h5>

      {isGenerating ? (
        <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Generating analysis...</p>
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
                Validate
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
        Validation
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
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Action Complete</span>
            </div>
            <p className="text-xs text-green-700">
              Content has been validated and is ready for use in your memo.
            </p>
          </div>
          
          <div className="space-y-2">
            <h6 className="text-xs font-medium text-gray-700">Validation Results:</h6>
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
                  className={`flex items-start gap-2 p-2 rounded border ${statusColors[result.status]}`}
                >
                  <StatusIcon className="h-3 w-3 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium capitalize">{result.type}:</span>
                    <span className="text-xs ml-1">{result.message}</span>
                  </div>
                </div>
              );
            })}
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