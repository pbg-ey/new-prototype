'use client';
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  CheckCircle,
  RefreshCw,
  Brain,
  X,
} from "lucide-react";

import {
  ValidationResult,
  WorkflowAction,
  WorkflowSource,
} from "./_actionWorkflow/ActionWorkflowTypes";
import {
  MOCK_ACTIONS,
  MOCK_AI_INSIGHTS,
  PHASE_INSIGHTS,
} from "./_actionWorkflow/ActionWorkflowData";
import ActionWorkflowCard from "./_actionWorkflow/ActionWorkflowCard";

export function ActionWorkflow() {
  const [actions, setActions] = React.useState<WorkflowAction[]>(MOCK_ACTIONS);
  const [expandedAction, setExpandedAction] = React.useState<string | null>(
    MOCK_ACTIONS[0]?.id ?? null
  );
  type WorkflowCategory = {
    id: string; // slug
    name: string;
    description: string;
    color: string;
    dynamic?: boolean; // user-added
  };

  const initialCategories: WorkflowCategory[] = React.useMemo(
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
    initialCategories[0].id
  );
  // Special pseudo-category id for creation state
  const NEW_PHASE_ID = "new-phase";
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [commandInput, setCommandInput] = React.useState("");
  const [showAiInsights, setShowAiInsights] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [showNewPhaseForm, setShowNewPhaseForm] = React.useState(false);
  const [lastActiveRealCategory, setLastActiveRealCategory] = React.useState<string>(initialCategories[0].id);

  React.useEffect(() => {
    if (!showCategoryDropdown) {
      return undefined;
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
    (categoryId: "facts" | "laws" | "analysis") => {
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

  // Build category objects with progress each render
  const CATEGORIES = React.useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        progress: getCategoryProgress(
          cat.id as "facts" | "laws" | "analysis" // user-added categories will have 0 progress by default
        ),
      })),
    [categories, getCategoryProgress]
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const currentIndex = CATEGORIES.findIndex(
          (category) => category.id === activeCategory
        );
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : CATEGORIES.length - 1;
        setActiveCategory(CATEGORIES[prevIndex].id);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const currentIndex = CATEGORIES.findIndex(
          (category) => category.id === activeCategory
        );
        const nextIndex =
          currentIndex < CATEGORIES.length - 1 ? currentIndex + 1 : 0;
        setActiveCategory(CATEGORIES[nextIndex].id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeCategory, CATEGORIES]);

  const filteredActions = React.useMemo(() => {
    const categoryForActions =
      activeCategory === NEW_PHASE_ID ? lastActiveRealCategory : activeCategory;
    return actions.filter((action) => action.category === categoryForActions);
  }, [actions, activeCategory, lastActiveRealCategory]);

  const currentCategory = React.useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory),
    [CATEGORIES, activeCategory]
  );

  const phaseInsights = React.useMemo(() => {
    const categoryForInsights =
      activeCategory === NEW_PHASE_ID ? lastActiveRealCategory : activeCategory;
    return PHASE_INSIGHTS[categoryForInsights as keyof typeof PHASE_INSIGHTS];
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
    return MOCK_AI_INSIGHTS.thoughtHistory.filter((thought) => {
      if (!thought.relatedActions || thought.relatedActions.length === 0) return true;
      return thought.relatedActions.some((actionId) => actionId.startsWith(prefix));
    });
  }, [activeCategory, lastActiveRealCategory]);

  // New phase draft state
  const [newPhaseName, setNewPhaseName] = React.useState("");
  const [newPhaseDescription, setNewPhaseDescription] = React.useState("");
  // Optional initial action draft state (inline creation with phase)
  const [newActionTitle, setNewActionTitle] = React.useState("");
  const [newActionDescription, setNewActionDescription] = React.useState("");
  const [newActionPriority, setNewActionPriority] = React.useState<"high"|"medium"|"low">("medium");

  const commitNewPhase = React.useCallback(() => {
    const name = newPhaseName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const exists = categories.some((c) => c.id === id);
    const finalId = exists ? `${id}-${Date.now()}` : id;
    const newCat: WorkflowCategory = {
      id: finalId,
      name,
      description: newPhaseDescription.trim() || "User-defined workflow phase",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      dynamic: true,
    };
    setCategories((prev) => [...prev, newCat]);

    // Optionally create an initial action if a title is provided
    if (newActionTitle.trim()) {
      const actionId = `${finalId}-${Date.now()}`;
      const initialAction: WorkflowAction = {
        id: actionId,
        title: newActionTitle.trim(),
        description: newActionDescription.trim() || "Initial action in newly created phase",
        category: finalId,
        currentStage: "sources",
        stageStatuses: {
          sources: "pending",
          generation: "pending",
          validation: "pending",
        },
        sources: [],
        estimatedDuration: "~5m",
        priority: newActionPriority,
      };
      setActions((prev) => [...prev, initialAction]);
      setExpandedAction(actionId); // auto-expand new action
    }

    setActiveCategory(finalId);
    setNewPhaseName("");
    setNewPhaseDescription("");
    setNewActionTitle("");
    setNewActionDescription("");
    setNewActionPriority("medium");
    setShowNewPhaseForm(false);
  }, [newPhaseName, newPhaseDescription, categories, newActionTitle, newActionDescription, newActionPriority]);

  const goPrev = () => {
    const idx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    if (activeCategory === NEW_PHASE_ID) {
      setActiveCategory(CATEGORIES[CATEGORIES.length - 1].id);
      setShowNewPhaseForm(false);
      return;
    }
    if (idx > 0) {
      const target = CATEGORIES[idx - 1].id;
      setActiveCategory(target);
      if (target !== NEW_PHASE_ID) setLastActiveRealCategory(target);
    }
  };
  const goNext = () => {
    if (activeCategory === NEW_PHASE_ID) return;
    const idx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    if (idx === CATEGORIES.length - 1) {
      setActiveCategory(NEW_PHASE_ID);
      setShowNewPhaseForm(false);
    } else if (idx >= 0) {
      const target = CATEGORIES[idx + 1].id;
      setActiveCategory(target);
      if (target !== NEW_PHASE_ID) setLastActiveRealCategory(target);
    }
  };

  // Keep lastActiveRealCategory updated when selecting directly
  React.useEffect(() => {
    if (activeCategory !== NEW_PHASE_ID) {
      setLastActiveRealCategory(activeCategory);
    }
  }, [activeCategory]);

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
                sources: "completed",
              },
            };
          })
        );
      }, 1500);
    };

    input.click();
  }, []);

  const handleGenerate = React.useCallback((actionId: string) => {
    setActions((previous) =>
      previous.map((action) => {
        if (action.id !== actionId) {
          return action;
        }

        return {
          ...action,
          stageStatuses: {
            ...action.stageStatuses,
            generation: "active",
          },
          currentStage: "generation",
        };
      })
    );

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
              id: `gen-${Date.now()}`,
              content: `Generated analysis for ${action.title}.`,
              type: "analysis",
              generatedAt: new Date(),
              wordCount,
              confidence,
            },
            stageStatuses: {
              ...action.stageStatuses,
              generation: "completed",
              validation: action.stageStatuses.validation === "pending"
                ? "pending"
                : action.stageStatuses.validation,
            },
            currentStage: "validation",
          };
        })
      );
    }, 1600);
  }, []);

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

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-col px-3 py-2">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="relative">
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={goPrev}
                disabled={activeCategory === CATEGORIES[0].id}
                className="group flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 transition-colors disabled:opacity-30 hover:bg-gray-50"
                aria-label="Previous phase"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>

              {/* Center Card */}
              <div className="relative flex min-w-0 flex-1" ref={dropdownRef}>
                {activeCategory === NEW_PHASE_ID ? (
                  showNewPhaseForm ? (
                    <div className="flex w-full flex-col gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">New Phase Details</h3>
                        <button
                          type="button"
                          onClick={() => setShowNewPhaseForm(false)}
                          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Close new phase form"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-gray-600">Phase Name<span className="ml-2 text-gray-400 lowercase">required</span></label>
                          <input
                            value={newPhaseName}
                            onChange={(e) => setNewPhaseName(e.target.value)}
                            placeholder="e.g. Risk Assessment"
                            className="mt-1 w-full rounded-md border bg-white px-2 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium uppercase tracking-wide text-gray-600">Description</label>
                          <textarea
                            value={newPhaseDescription}
                            onChange={(e) => setNewPhaseDescription(e.target.value)}
                            placeholder="Describe the purpose of this phase"
                            rows={2}
                            className="mt-1 w-full resize-none rounded-md border bg-white px-2 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
                          />
                        </div>
                        <div className="pt-1 border-t">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700">Initial Action (optional)</p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] font-medium text-gray-600">Title</label>
                              <input
                                value={newActionTitle}
                                onChange={(e) => setNewActionTitle(e.target.value)}
                                placeholder="First action title"
                                className="mt-1 w-full rounded-md border bg-white px-2 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-gray-600">Description</label>
                              <textarea
                                value={newActionDescription}
                                onChange={(e) => setNewActionDescription(e.target.value)}
                                placeholder="Describe the initial action"
                                rows={2}
                                className="mt-1 w-full resize-none rounded-md border bg-white px-2 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-gray-600">Priority</label>
                              <select
                                value={newActionPriority}
                                onChange={(e) => setNewActionPriority(e.target.value as "high" | "medium" | "low")}
                                className="mt-1 w-full rounded-md border bg-white px-2 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowNewPhaseForm(false);
                          }}
                          className="h-7 px-2 text-xs"
                        >Cancel</Button>
                        <Button
                          size="sm"
                          onClick={commitNewPhase}
                          disabled={!newPhaseName.trim()}
                          className="h-7 px-3 text-xs"
                        >Create Phase</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNewPhaseForm(true)}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-gray-400"
                    >
                      <span className="text-sm font-semibold text-gray-700">Create New Section</span>
                      <span className="mt-1 text-xs text-gray-500">Add another workflow phase</span>
                    </button>
                  )
                ) : (
                  (() => {
                    const category = currentCategory ?? CATEGORIES[0];
                    const progressPercent =
                      category.progress.total > 0
                        ? Math.round(
                            (category.progress.completed /
                              category.progress.total) * 100
                          )
                        : 0;
                    const isCompleted =
                      category.progress.total > 0 &&
                      category.progress.completed === category.progress.total;
                    return (
                      <div className="flex w-full flex-col justify-between rounded-xl border bg-gray-50 p-4 shadow-sm transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() =>
                                setShowCategoryDropdown(!showCategoryDropdown)
                              }
                              className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-900"
                            >
                              <span className="truncate">{category.name}</span>
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                  showCategoryDropdown ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {category.description}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <RefreshCw className="h-4 w-4 animate-pulse text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-gray-600 transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {progressPercent}%
                          </span>
                        </div>
                        {showCategoryDropdown && (
                          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-md border bg-white shadow-lg">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setActiveCategory(cat.id);
                                  setShowCategoryDropdown(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                                  activeCategory === cat.id
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="font-medium">{cat.name}</div>
                                <div className="mt-0.5 text-gray-500">
                                  {cat.description}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Next / New Phase */}
              <button
                onClick={goNext}
                className="group flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 transition-colors hover:bg-gray-50"
                aria-label="Next phase or new phase"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id;
                const isCompleted =
                  category.progress.completed === category.progress.total &&
                  category.progress.total > 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive
                        ? "w-4 bg-gray-600"
                        : isCompleted
                        ? "w-1.5 bg-green-500"
                        : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to ${category.name}`}
                  />
                );
              })}
              {/* Indicator for new phase ghost card */}
              <button
                onClick={() => setActiveCategory(NEW_PHASE_ID)}
                className={`h-1.5 w-4 rounded-full border border-dashed transition-colors ${
                  activeCategory === NEW_PHASE_ID
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Create new phase"
              />
            </div>
          </div>

          <div className="relative flex flex-1 flex-col overflow-hidden min-h-80">
            <div
              className={`flex h-full flex-col transition-opacity duration-300 ${
                showAiInsights ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex-1 space-y-2 overflow-y-auto">
                {filteredActions.length === 0 ? (
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
                ) : (
                  filteredActions.map((action) => (
                    <ActionWorkflowCard
                      key={action.id}
                      action={action}
                      expanded={expandedAction === action.id}
                      onToggleExpanded={() =>
                        setExpandedAction(
                          expandedAction === action.id ? null : action.id
                        )
                      }
                      onAddSource={handleAddSource}
                      onGenerate={handleGenerate}
                      onValidate={handleValidate}
                    />
                  ))
                )}
              </div>

              <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAiInsights(!showAiInsights)}
                  aria-label={
                    showAiInsights
                      ? "Close AI insights overlay"
                      : "Open AI insights overlay"
                  }
                  className={`h-8 w-8 rounded-full transition-colors ${
                    showAiInsights
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {showAiInsights ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <Brain className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={commandInput}
                      onChange={(event) => setCommandInput(event.target.value)}
                      placeholder="Create new action... (e.g., Research Delaware tax requirements)"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && commandInput.trim()) {
                          // TODO: Add create action functionality
                          console.log("Create action:", commandInput.trim());
                          setCommandInput("");
                        }
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="px-4 py-2 text-sm"
                    disabled={!commandInput.trim()}
                    onClick={() => {
                      if (commandInput.trim()) {
                        // TODO: Add create action functionality
                        console.log("Create action:", commandInput.trim());
                        setCommandInput("");
                      }
                    }}
                  >
                    Create
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>💡 Try: &ldquo;Analyze Section 199A deduction eligibility&rdquo;</span>
                  <span>•</span>
                  <span>⚡ Quick add with Enter</span>
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-0 z-20 flex flex-col border border-blue-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                showAiInsights
                  ? "translate-y-0 pointer-events-auto"
                  : "translate-y-full pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Brain className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      AI Strategic Insights
                    </p>
                    <p className="text-xs text-blue-600">
                      {currentCategory?.name ?? "Current Phase"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Collapse AI insights"
                  onClick={() => setShowAiInsights(false)}
                  className="h-7 w-7 rounded-full text-blue-600 hover:bg-blue-100"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Phase Objective
                  </h4>
                  {phaseInsights ? (
                    <>
                      <p className="text-sm leading-relaxed text-blue-900">
                        {phaseInsights.goal}
                      </p>
                      <p className="text-xs leading-relaxed text-blue-700/80">
                        {phaseInsights.alignment}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-blue-600/70">Custom phase has no predefined objective yet.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    AI Approach
                  </h4>
                  {phaseInsights ? (
                    <>
                      <p className="text-sm leading-relaxed text-blue-900">
                        {phaseInsights.approach}
                      </p>
                      <ul className="space-y-1.5">
                        {phaseInsights.keyTasks.map((task, index) => (
                          <li key={task} className="flex gap-2 text-xs text-blue-800">
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-blue-100 text-center text-[10px] font-semibold text-blue-700 leading-4">
                              {index + 1}
                            </span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-xs text-blue-600/70">Define tasks for this custom phase as you add actions.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Thought Process
                  </h4>
                  <div className="space-y-3">
                    {phaseThoughts.slice(0, 5).map((thought) => (
                      <div
                        key={thought.id}
                        className="rounded-lg border border-blue-100 bg-blue-50/80 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                              thought.type === "decision"
                                ? "bg-blue-600 text-white"
                                : thought.type === "analysis"
                                ? "bg-green-600 text-white"
                                : thought.type === "reasoning"
                                ? "bg-purple-600 text-white"
                                : "bg-slate-400 text-white"
                            }`}
                          >
                            {thought.type === "decision"
                              ? "!"
                              : thought.type === "analysis"
                              ? "A"
                              : thought.type === "reasoning"
                              ? "R"
                              : "C"}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-semibold text-blue-900">
                                {thought.title}
                              </h5>
                              {thought.confidence && (
                                <span className="text-[10px] font-medium text-blue-700/80">
                                  {thought.confidence}% confidence
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed text-blue-900/90">
                              {thought.content}
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-blue-600/70">
                              {new Date(thought.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {phaseThoughts.length === 0 && (
                      <p className="text-xs text-blue-700/80">
                        No specific reasoning logs yet for this phase. I&apos;ll capture my thinking as we progress.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Why These Actions
                  </h4>
                  <div className="space-y-2">
                    {filteredActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-blue-900">
                            {action.title}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {action.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-blue-800">
                          {action.aiReasoning?.reasoning ??
                            "This action supports the overall workflow progression for this phase."}
                        </p>
                      </div>
                    ))}
                    {filteredActions.length === 0 && (
                      <p className="text-xs text-blue-700/80">
                        I have not created any actions for this phase yet. Once I do, you will see the rationale here.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Upcoming Moves
                  </h4>
                  <ul className="grid gap-2 text-xs text-blue-800 sm:grid-cols-2">
                    {MOCK_AI_INSIGHTS.nextSteps.map((step, index) => (
                      <li
                        key={`${step}-${index}`}
                        className="rounded-md border border-blue-100 bg-white/80 p-3"
                      >
                        <p className="font-medium text-blue-900">{step}</p>
                        <p className="mt-1 text-[11px] text-blue-700/80">
                          Queued after we complete the current phase checkpoints.
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      {activeCategory === NEW_PHASE_ID && showNewPhaseForm && (
        <div className="border-t border-dashed border-gray-300 bg-gray-50 px-4 py-3">
          <div className="flex flex-col gap-2 max-w-md">
            <input
              type="text"
              placeholder="Phase name"
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <textarea
              placeholder="Description"
              value={newPhaseDescription}
              onChange={(e) => setNewPhaseDescription(e.target.value)}
              className="w-full h-20 resize-none rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewPhaseForm(false)}
                className="h-7 px-3"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={commitNewPhase}
                disabled={!newPhaseName.trim()}
                className="h-7 px-3"
              >
                Add Phase
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

