'use client';

import * as React from "react";
import { FileText, CheckCircle, ChevronDown } from "lucide-react";

import ActionWorkflowCard from "./_actionWorkflow/ActionWorkflowCard";
import { ActionCommandBar } from "./_actionWorkflow/ActionCommandBar";
import { AiInsightsPanel } from "./_actionWorkflow/AiInsightsPanel";
import {
  MOCK_ACTIONS,
  MOCK_AI_INSIGHTS,
  PHASE_INSIGHTS,
} from "./_actionWorkflow/ActionWorkflowData";
import {
  ValidationResult,
  WorkflowAction,
  WorkflowSource,
  AiAnalysisState,
  AiNotification,
  PhaseRecommendation,
} from "./_actionWorkflow/ActionWorkflowTypes";
import { AiNotificationBanner } from "./_actionWorkflow/AiNotificationBanner";
import { AiAnalysisProgress } from "./_actionWorkflow/AiAnalysisProgress";
import {
  PhaseNavigation,
  WorkflowCategoryDisplay,
} from "./_actionWorkflow/PhaseNavigation";
import { NewPhaseForm } from "./_actionWorkflow/NewPhaseForm";

type WorkflowCategory = {
  id: string;
  name: string;
  description: string;
  color: string;
  dynamic?: boolean;
};

type PendingAttachment = {
  id: string;
  file: File;
};

const NEW_PHASE_ID = "new-phase";

export function WorkflowPanel() {
  const [actions, setActions] = React.useState<WorkflowAction[]>(MOCK_ACTIONS);
  const [expandedAction, setExpandedAction] = React.useState<string | null>(
    MOCK_ACTIONS[0]?.id ?? null
  );

  const initialCategories = React.useMemo<WorkflowCategory[]>(
    () => [
      {
        id: "facts",
        name: "Company Facts",
        description: "Gather business context and operational details",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      },
      {
        id: "laws",
        name: "Codes & Regulations",
        description: "Research applicable laws and regulatory requirements",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      },
      {
        id: "analysis",
        name: "Analysis & Recommendations",
        description: "Synthesize findings into actionable guidance",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      },
    ],
    []
  );

  const [categories, setCategories] = React.useState<WorkflowCategory[]>(
    initialCategories
  );
  const [activeCategory, setActiveCategory] = React.useState<string>(
    initialCategories[0]?.id ?? "facts"
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  const [commandInput, setCommandInput] = React.useState("");
  const [showAiInsights, setShowAiInsights] = React.useState(false);
  const [pendingAttachments, setPendingAttachments] = React.useState<PendingAttachment[]>([]);

  const [newPhaseName, setNewPhaseName] = React.useState("");
  const [newPhaseDescription, setNewPhaseDescription] = React.useState("");
  const newPhaseNameInputRef = React.useRef<HTMLInputElement | null>(null);

  const [lastActiveRealCategory, setLastActiveRealCategory] = React.useState(
    initialCategories[0]?.id ?? "facts"
  );

  const handleSelectCategory = React.useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setShowCategoryDropdown(false);
  }, []);

  React.useEffect(() => {
    if (!showCategoryDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCategoryDropdown]);

  const getCategoryProgress = React.useCallback(
    (categoryId: string) => {
      const categoryActions = actions.filter(
        (action) => action.category === categoryId
      );
      const completedActions = categoryActions.filter(
        (action) => action.stageStatuses.validation === "completed"
      );

      return {
        completed: completedActions.length,
        total: categoryActions.length,
      };
    },
    [actions]
  );

  const categoriesWithProgress = React.useMemo<WorkflowCategoryDisplay[]>(
    () =>
      categories.map((category) => ({
        ...category,
        progress: getCategoryProgress(category.id),
      })),
    [categories, getCategoryProgress]
  );

  const filteredActions = React.useMemo(() => {
    if (activeCategory === NEW_PHASE_ID) {
      return [] as WorkflowAction[];
    }
    return actions.filter((action) => action.category === activeCategory);
  }, [actions, activeCategory]);

  const activeActions = React.useMemo(() => 
    filteredActions.filter((action) => action.stageStatuses.validation !== "completed"),
    [filteredActions]
  );

  const completedActions = React.useMemo(() => 
    filteredActions.filter((action) => action.stageStatuses.validation === "completed"),
    [filteredActions]
  );

  const [showCompletedActions, setShowCompletedActions] = React.useState(false);

  // AI assistance state
  const [aiAnalysisState, setAiAnalysisState] = React.useState<AiAnalysisState | null>(null);
  const [aiNotifications, setAiNotifications] = React.useState<AiNotification[]>([]);

  // AI analysis functions
  const startAiAnalysis = React.useCallback((message: string) => {
    setAiAnalysisState({
      isAnalyzing: true,
      analysisType: 'actions',
      progress: 0,
      currentStep: message,
      startedAt: new Date()
    });

    // Simulate AI analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Complete analysis and show recommendations
        setTimeout(() => {
          setAiAnalysisState(null);
          
          // Add sample recommendation
          const notification: AiNotification = {
            id: `ai-notification-${Date.now()}`,
            type: 'phase_suggestion',
            title: '10X.ai Recommendation',
            message: 'Based on your workflow, I suggest adding a "Review" phase.',
            actionable: true,
            data: {
              id: `phase-${Date.now()}`,
              suggestedName: 'Review Phase',
              suggestedDescription: 'Quality assurance and peer review',
              requiredActions: ['Peer review', 'Quality check', 'Final approval'],
              confidence: 0.85,
              reasoning: 'Your current workflow lacks validation steps.',
              createdAt: new Date()
            },
            createdAt: new Date()
          };
          
          setAiNotifications(prev => [...prev, notification]);
        }, 1000);
      } else {
        setAiAnalysisState(prev => prev ? {
          ...prev,
          progress: Math.round(progress),
          currentStep: progress < 30 ? "Analyzing workflow structure..." :
                      progress < 60 ? "Identifying optimization opportunities..." :
                      progress < 90 ? "Generating recommendations..." :
                      "Finalizing analysis..."
        } : null);
      }
    }, 200);
  }, []);

  const currentCategory = React.useMemo(
    () => categoriesWithProgress.find((category) => category.id === activeCategory),
    [categoriesWithProgress, activeCategory]
  );

  const phaseInsights = React.useMemo(() => {
    const effectiveCategory =
      activeCategory === NEW_PHASE_ID ? lastActiveRealCategory : activeCategory;
    if (effectiveCategory in PHASE_INSIGHTS) {
      return PHASE_INSIGHTS[effectiveCategory as keyof typeof PHASE_INSIGHTS];
    }
    return undefined;
  }, [activeCategory, lastActiveRealCategory]);

  const phaseThoughts = React.useMemo(() => {
    const prefixMap = {
      facts: "facts-",
      laws: "laws-",
      analysis: "analysis-",
    } as const;
    const effectiveCategory =
      activeCategory === NEW_PHASE_ID ? lastActiveRealCategory : activeCategory;
    const prefix = prefixMap[effectiveCategory as keyof typeof prefixMap];
    if (!prefix) {
      return MOCK_AI_INSIGHTS.thoughtHistory.filter(
        (thought) => !thought.relatedActions || thought.relatedActions.length === 0
      );
    }
    return MOCK_AI_INSIGHTS.thoughtHistory.filter((thought) => {
      if (!thought.relatedActions || thought.relatedActions.length === 0) {
        return true;
      }
      return thought.relatedActions.some((actionId) => actionId.startsWith(prefix));
    });
  }, [activeCategory, lastActiveRealCategory]);

  const commitNewPhase = React.useCallback(() => {
    const name = newPhaseName.trim();
    if (!name) {
      return;
    }

    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const exists = categories.some((category) => category.id === baseId);
    const finalId = exists ? `${baseId}-${Date.now()}` : baseId;

    const newCategory: WorkflowCategory = {
      id: finalId,
      name,
      description:
        newPhaseDescription.trim() || "User-defined workflow phase",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      dynamic: true,
    };

    setCategories((previous) => [...previous, newCategory]);
    setActiveCategory(finalId);
    setLastActiveRealCategory(finalId);
    setNewPhaseName("");
    setNewPhaseDescription("");
  }, [categories, newPhaseDescription, newPhaseName]);

  const goPrev = React.useCallback(() => {
    if (categoriesWithProgress.length === 0) {
      return;
    }

    if (activeCategory === NEW_PHASE_ID) {
      const lastId = categoriesWithProgress[categoriesWithProgress.length - 1].id;
      setActiveCategory(lastId);
      setLastActiveRealCategory(lastId);
      return;
    }

    const currentIndex = categoriesWithProgress.findIndex(
      (category) => category.id === activeCategory
    );

    if (currentIndex === 0) {
      setActiveCategory(NEW_PHASE_ID);
      return;
    }

    if (currentIndex > 0) {
      const target = categoriesWithProgress[currentIndex - 1].id;
      setActiveCategory(target);
      setLastActiveRealCategory(target);
    }
  }, [activeCategory, categoriesWithProgress]);

  const goNext = React.useCallback(() => {
    if (categoriesWithProgress.length === 0) {
      return;
    }

    if (activeCategory === NEW_PHASE_ID) {
      const firstId = categoriesWithProgress[0].id;
      setActiveCategory(firstId);
      setLastActiveRealCategory(firstId);
      return;
    }

    const currentIndex = categoriesWithProgress.findIndex(
      (category) => category.id === activeCategory
    );

    if (currentIndex === categoriesWithProgress.length - 1) {
      setActiveCategory(NEW_PHASE_ID);
      return;
    }

    if (currentIndex >= 0) {
      const target = categoriesWithProgress[currentIndex + 1].id;
      setActiveCategory(target);
      setLastActiveRealCategory(target);
    }
  }, [activeCategory, categoriesWithProgress]);

  React.useEffect(() => {
    if (activeCategory === NEW_PHASE_ID) {
      newPhaseNameInputRef.current?.focus();
    }
  }, [activeCategory]);

  const handleCancelNewPhase = React.useCallback(() => {
    const fallback =
      lastActiveRealCategory && lastActiveRealCategory !== NEW_PHASE_ID
        ? lastActiveRealCategory
        : initialCategories[0]?.id;
    setActiveCategory(fallback ?? "facts");
    setNewPhaseName("");
    setNewPhaseDescription("");
  }, [initialCategories, lastActiveRealCategory]);

  const formatFileSize = React.useCallback((bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const handleCommandSubmit = React.useCallback(() => {
    const trimmed = commandInput.trim();
    if (!trimmed) {
      return;
    }

    // Create new workflow action
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      title: trimmed,
      description: `User-created action: ${trimmed}`,
      category: activeCategory === NEW_PHASE_ID ? lastActiveRealCategory : activeCategory,
      currentStage: "sources",
      stageStatuses: {
        sources: pendingAttachments.length > 0 ? "active" : "pending",
        generation: "pending",
        validation: "pending",
      },
      sources: pendingAttachments.map((attachment, index) => ({
        id: `source-${Date.now()}-${index}`,
        name: attachment.file.name,
        type: "upload",
        status: "ready",
        size: formatFileSize(attachment.file.size),
      })),
      estimatedDuration: "5-10 min",
      priority: "medium",
      aiReasoning: {
        trigger: "User-created action",
        reasoning: "This action was created directly by the user through the command bar.",
      },
    };

    // Add the new action to the actions list
    setActions((previous) => [...previous, newAction]);
    
    // Clear input and attachments
    setCommandInput("");
    setPendingAttachments([]);
    
    // Trigger AI analysis of the new action
    setTimeout(() => {
      startAiAnalysis("Analyzing new action and workflow impact...");
    }, 500);
  }, [commandInput, pendingAttachments, activeCategory, lastActiveRealCategory, formatFileSize, startAiAnalysis]);

  const handleAttachFiles = React.useCallback((files: File[]) => {
    const timestamp = Date.now();
    const newAttachments = files.map((file, index) => ({
      id: `attachment-${timestamp}-${index}`,
      file,
    }));
    setPendingAttachments((previous) => [...previous, ...newAttachments]);
  }, []);

  const handleRemoveAttachment = React.useCallback((attachmentId: string) => {
    setPendingAttachments((previous) =>
      previous.filter((attachment) => attachment.id !== attachmentId)
    );
  }, []);

  React.useEffect(() => {
    if (activeCategory !== NEW_PHASE_ID) {
      setLastActiveRealCategory(activeCategory);
    }
  }, [activeCategory]);

  const runSourceAnalysis = React.useCallback((actionId: string) => {
    // Start analysis
    setActions((previous) =>
      previous.map((action) => {
        if (action.id !== actionId || action.sources.length === 0) {
          return action;
        }

        return {
          ...action,
          sourceAnalysis: {
            id: `analysis-${Date.now()}`,
            status: 'analyzing',
            confidence: 0,
            relevanceScore: 0,
            analyzedAt: new Date(),
          },
        };
      })
    );

    // Simulate analysis completion
    setTimeout(() => {
      setActions((previous) =>
        previous.map((action) => {
          if (action.id !== actionId) {
            return action;
          }

          // Mock analysis results based on action type
          const isFactsAction = action.category === 'facts';
          
          // Simulate different analysis outcomes
          const outcomes = [
            {
              status: 'sufficient' as const,
              confidence: 0.85 + Math.random() * 0.12,
              relevanceScore: 0.8 + Math.random() * 0.15,
            },
            {
              status: 'insufficient' as const,
              confidence: 0.6 + Math.random() * 0.2,
              relevanceScore: 0.7 + Math.random() * 0.2,
              gaps: [
                'Specific state jurisdiction details',
                'Current tax year regulations',
                'Industry-specific exemptions',
              ].slice(0, Math.floor(Math.random() * 3) + 1),
              recommendations: [
                'Upload current state tax code sections',
                'Include recent tax bulletins or advisories',
                'Add company-specific documentation',
              ].slice(0, Math.floor(Math.random() * 3) + 1),
            },
            {
              status: 'irrelevant' as const,
              confidence: 0.4 + Math.random() * 0.3,
              relevanceScore: 0.2 + Math.random() * 0.3,
              gaps: ['All sources are for different jurisdictions or tax types'],
              recommendations: [
                'Upload documents specific to your business type',
                'Include materials for your operational states',
              ],
            },
          ];

          // Bias toward sufficient for facts, insufficient for laws
          const weights = isFactsAction ? [0.6, 0.3, 0.1] : [0.3, 0.5, 0.2];
          const rand = Math.random();
          let selectedOutcome;
          
          if (rand < weights[0]) {
            selectedOutcome = outcomes[0];
          } else if (rand < weights[0] + weights[1]) {
            selectedOutcome = outcomes[1];
          } else {
            selectedOutcome = outcomes[2];
          }

          return {
            ...action,
            sourceAnalysis: {
              id: `analysis-${Date.now()}`,
              ...selectedOutcome,
              analyzedAt: new Date(),
            },
            needsUserSources: selectedOutcome.status !== 'sufficient',
          };
        })
      );
    }, 2000);
  }, []);

  const handleAddSource = React.useCallback((actionId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt";

    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }

      const uploadedSources: WorkflowSource[] = Array.from(files).map(
        (file, index) => ({
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          type: "upload",
          status: "uploading",
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadProgress: 0,
        })
      );

      const uploadedIds = uploadedSources.map((source) => source.id);

      setActions((previous) =>
        previous.map((action) => {
          if (action.id !== actionId) {
            return action;
          }

          return {
            ...action,
            sources: [...action.sources, ...uploadedSources],
            stageStatuses: {
              ...action.stageStatuses,
              sources: "active",
            },
          };
        })
      );

      setTimeout(() => {
        setActions((previous) =>
          previous.map((action) => {
            if (action.id !== actionId) {
              return action;
            }

            return {
              ...action,
              sources: action.sources.map((source) =>
                uploadedIds.includes(source.id)
                  ? { ...source, status: "ready", uploadProgress: 100 }
                  : source
              ),
              stageStatuses: {
                ...action.stageStatuses,
                sources: "active", // Keep active until analysis completes
              },
              needsUserSources: true, // Mark as user-uploaded sources
            };
          })
        );
        
        // Run analysis on newly uploaded sources
        runSourceAnalysis(actionId);
      }, 1500);
    };

    input.click();
  }, [runSourceAnalysis]);



  const handleValidate = React.useCallback((actionId: string) => {
    setActions((previous) =>
      previous.map((action) => {
        if (action.id !== actionId) {
          return action;
        }

        return {
          ...action,
          stageStatuses: {
            ...action.stageStatuses,
            validation: "active",
          },
          currentStage: "validation",
        };
      })
    );

    setTimeout(() => {
      const mockValidations: ValidationResult[] = [
        {
          id: `val-${Date.now()}-accuracy`,
          type: "accuracy",
          status: "pass",
          message: "Content accuracy verified against provided sources",
          severity: "low",
        },
        {
          id: `val-${Date.now()}-completeness`,
          type: "completeness",
          status: Math.random() > 0.6 ? "warning" : "pass",
          message:
            Math.random() > 0.6
              ? "Consider adding more detail on regional compliance nuances"
              : "All key checkpoints addressed",
          severity: "medium",
        },
      ];

      setActions((previous) =>
        previous.map((action) => {
          if (action.id !== actionId) {
            return action;
          }

          return {
            ...action,
            validationResults: mockValidations,
            stageStatuses: {
              ...action.stageStatuses,
              validation: "completed",
            },
          };
        })
      );
    }, 2000);
  }, []);

  const handleDismiss = React.useCallback((actionId: string) => {
    setActions((previous) =>
      previous.map((action) => {
        if (action.id !== actionId) {
          return action;
        }

        return {
          ...action,
          stageStatuses: {
            ...action.stageStatuses,
            validation: "completed",
          },
        };
      })
    );
  }, []);

  const handleValidateSources = React.useCallback((actionId: string) => {
    // Complete sources and start generation immediately
    setActions((previous) =>
      previous.map((action) => {
        if (action.id !== actionId) {
          return action;
        }

        return {
          ...action,
          stageStatuses: {
            ...action.stageStatuses,
            sources: "completed",
            generation: "active",
          },
          currentStage: "generation",
        };
      })
    );

    // Simulate generation process
    setTimeout(() => {
      setActions((previous) =>
        previous.map((action) => {
          if (action.id !== actionId) {
            return action;
          }

          const wordCount = Math.floor(450 + Math.random() * 350);
          const confidence = Math.min(0.97, 0.85 + Math.random() * 0.12);

          return {
            ...action,
            generatedContent: {
              id: `content-${Date.now()}`,
              content: `Based on the analysis of ${action.sources.length} sources, here are the key findings and recommendations for ${action.title.toLowerCase()}...

## Executive Summary
The comprehensive review reveals several critical areas requiring immediate attention and strategic planning.

## Key Findings
- Regulatory compliance requirements vary significantly across jurisdictions
- Current operational structure may benefit from optimization
- Risk mitigation strategies should be prioritized

## Recommendations
1. Implement structured compliance monitoring
2. Review current operational procedures
3. Establish regular audit cycles
4. Consider strategic partnerships for enhanced capabilities

## Next Steps
The analysis indicates that immediate action is recommended to ensure continued operational excellence and regulatory adherence.`,
              type: "analysis",
              generatedAt: new Date(),
              wordCount,
              confidence,
            },
            stageStatuses: {
              ...action.stageStatuses,
              generation: "completed",
            },
            currentStage: "validation",
          };
        })
      );
    }, 3000);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-col px-3 py-2">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <PhaseNavigation
            categories={categoriesWithProgress}
            activeCategory={activeCategory}
            newPhaseId={NEW_PHASE_ID}
            onPrev={goPrev}
            onNext={goNext}
            onSelectCategory={handleSelectCategory}
            onSelectNewPhase={() => setActiveCategory(NEW_PHASE_ID)}
            showDropdown={showCategoryDropdown}
            onToggleDropdown={() => setShowCategoryDropdown((previous) => !previous)}
            onCloseDropdown={() => setShowCategoryDropdown(false)}
            dropdownRef={dropdownRef}
          />

          {/* AI Assistance Components */}
          {aiAnalysisState?.isAnalyzing && (
            <AiAnalysisProgress analysisState={aiAnalysisState} />
          )}

          {aiNotifications.length > 0 && (
            <AiNotificationBanner
              notifications={aiNotifications}
              onDismiss={(notificationId: string) => {
                setAiNotifications(prev => prev.filter(n => n.id !== notificationId));
              }}
              onAcceptPhaseRecommendation={(recommendation: PhaseRecommendation) => {
                // Accept phase recommendation - add new phase
                console.log("Accepting phase recommendation:", recommendation);
                setAiNotifications(prev => prev.filter(n => 
                  n.type !== 'phase_suggestion' || 
                  (n.data as PhaseRecommendation)?.id !== recommendation.id
                ));
              }}
              onRejectPhaseRecommendation={(notificationId: string) => {
                setAiNotifications(prev => prev.filter(n => n.id !== notificationId));
              }}
            />
          )}

          <div className="relative flex flex-1 flex-col overflow-hidden min-h-80">
            <div
              className={`flex h-full flex-col transition-opacity duration-300 ${
                showAiInsights ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex-1 space-y-2 overflow-y-auto">
                {activeCategory === NEW_PHASE_ID ? (
                  <NewPhaseForm
                    name={newPhaseName}
                    description={newPhaseDescription}
                    onChangeName={setNewPhaseName}
                    onChangeDescription={setNewPhaseDescription}
                    onCancel={handleCancelNewPhase}
                    onSubmit={commitNewPhase}
                    canSubmit={Boolean(newPhaseName.trim())}
                    nameInputRef={newPhaseNameInputRef}
                  />
                ) : activeActions.length === 0 && completedActions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-6 text-center">
                    <div className="space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        No actions in this phase yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Actions will appear here as you progress through your research
                      </p>
                    </div>
                  </div>
                ) : activeActions.length === 0 && completedActions.length > 0 ? (
                  <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-4 text-center">
                    <p className="text-sm font-medium text-foreground">All actions completed!</p>
                    <p className="text-xs text-muted-foreground">
                      {completedActions.length} action{completedActions.length !== 1 ? 's' : ''} finished
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {activeActions.map((action) => (
                      <ActionWorkflowCard
                        key={action.id}
                        action={action}
                        expanded={expandedAction === action.id}
                        onToggleExpanded={() => 
                          setExpandedAction(expandedAction === action.id ? null : action.id)
                        }
                        onAddSource={handleAddSource}
                        onValidate={handleValidate}
                        onDismiss={handleDismiss}
                        onValidateSources={handleValidateSources}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Actions - Fixed at bottom above command bar */}
              {completedActions.length > 0 && activeCategory !== NEW_PHASE_ID && (
                <div className="border-t border-gray-100 pt-2">
                  <div className="rounded-md border border-green-200 bg-green-50/30">
                    <button
                      onClick={() => setShowCompletedActions(!showCompletedActions)}
                      className="flex w-full items-center justify-between p-2.5 text-left hover:bg-green-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Completed Actions ({completedActions.length})
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${showCompletedActions ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCompletedActions && (
                      <div className="border-t border-green-200 p-2 space-y-1.5 max-h-40 overflow-y-auto">
                        {completedActions.map((action) => (
                          <ActionWorkflowCard
                            key={action.id}
                            action={action}
                            expanded={expandedAction === action.id}
                            onToggleExpanded={() => 
                              setExpandedAction(expandedAction === action.id ? null : action.id)
                            }
                            onAddSource={handleAddSource}
                            onValidate={handleValidate}
                            onDismiss={handleDismiss}
                            onValidateSources={handleValidateSources}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <ActionCommandBar
                value={commandInput}
                onChange={setCommandInput}
                onSubmit={handleCommandSubmit}
                    onAttach={handleAttachFiles}
                    onToggleInsights={() => setShowAiInsights((previous) => !previous)}
                    insightsOpen={showAiInsights}
                    attachments={pendingAttachments.map((attachment) => ({
                      id: attachment.id,
                      name: attachment.file.name,
                      size: formatFileSize(attachment.file.size),
                    }))}
                    onRemoveAttachment={handleRemoveAttachment}
              />
            </div>

            <AiInsightsPanel
              show={showAiInsights}
              onClose={() => setShowAiInsights(false)}
              categoryName={currentCategory?.name}
              phaseInsights={phaseInsights}
              thoughts={phaseThoughts}
              actions={filteredActions}
              nextSteps={MOCK_AI_INSIGHTS.nextSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}