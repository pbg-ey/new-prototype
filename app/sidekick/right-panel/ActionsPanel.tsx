'use client';
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Info, X, Brain } from "lucide-react";
import type { Recommendation, RecommendationAttachment, AIThought, AIPhase } from "../type";

type ActionType = "information" | "generation";

type StageStatus = 'locked' | 'available' | 'active' | 'completed';

interface Stage {
  key: Recommendation['category'];
  label: string;
  status: StageStatus;
  completedCount: number;
  totalCount: number;
  completionRate: number; // 0-100
}

const ACTION_INTENT_MAP: Record<Recommendation["intent"], ActionType> = {
  add_evidence: "information",
  housekeeping: "information",
  draft: "generation",
  re_analyze: "generation",
  re_score: "generation",
};

const TYPE_META: Record<
  ActionType,
  {
    label: string;
    primaryCta: string;
    primaryVariant: "default" | "secondary" | "outline" | "ghost";
  }
> = {
  information: {
    label: "Info Request",
    primaryCta: "Attach to Project",
    primaryVariant: "default",
  },
  generation: {
    label: "Generator",
    primaryCta: "Generate",
    primaryVariant: "default",
  },
};

const DEFAULT_INFO_PROMPT = "Add or review the files to be saved to the current research.";

type FilterKey = "all" | Recommendation["category"];

const CATEGORY_ORDER: Recommendation["category"][] = ["facts", "laws", "analysis"];
const CATEGORY_LABELS: Record<Recommendation["category"], string> = {
  facts: "Company Facts",
  laws: "Laws",
  analysis: "Analysis",
};

const getStageStatus = (
  category: Recommendation['category'], 
  stats: { total: number; completed: number },
  allStats: Record<Recommendation['category'], { total: number; completed: number }>
): StageStatus => {
  // Stage progression rules: facts -> laws -> analysis
  const factsStarted = allStats.facts.total > 0;
  const lawsStarted = allStats.laws.total > 0;

  if (category === 'facts') {
    // Facts are always available
    if (stats.total === 0) return 'available';
    if (stats.completed === stats.total) return 'completed';
    return 'active';
  }

  if (category === 'laws') {
    // Laws unlock when facts have started
    if (!factsStarted) return 'locked';
    if (stats.total === 0) return 'available';
    if (stats.completed === stats.total) return 'completed';
    return 'active';
  }

  if (category === 'analysis') {
    // Analysis unlocks when laws have started
    if (!lawsStarted) return 'locked';
    if (stats.total === 0) return 'available';
    if (stats.completed === stats.total) return 'completed';
    return 'active';
  }

  return 'available';
};

const getStageDisplayText = (stage: Stage): string => {
  switch (stage.status) {
    case 'locked':
      return stage.label;
    case 'available':
      return stage.totalCount > 0 ? `${stage.label} ${stage.completedCount}/${stage.totalCount}` : stage.label;
    case 'active':
      return stage.totalCount > 0 
        ? `${stage.label} ${stage.completionRate}%`
        : stage.label;
    case 'completed':
      return `✓ ${stage.label}`;
  }
};

const getStageStatusColor = (status: StageStatus): string => {
  switch (status) {
    case 'locked': 
      return 'text-muted-foreground/40 bg-muted/20 cursor-not-allowed';
    case 'available': 
      return 'text-muted-foreground bg-muted/40 hover:bg-muted/60';
    case 'active': 
      return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'completed': 
      return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100';
  }
};

const getAIStageDescription = (stages: Stage[]): {
  stage: string;
  reasoning: string;
  nextStep: string;
} => {
  const factsStage = stages.find(s => s.key === 'facts');
  const lawsStage = stages.find(s => s.key === 'laws');
  const analysisStage = stages.find(s => s.key === 'analysis');

  // Determine current primary stage based on what's active/available
  if (analysisStage?.status === 'active') {
    return {
      stage: "Phase 4 — Analysis",
      reasoning: "Now I'm synthesizing the law with your company facts to provide comprehensive guidance on tax implications and recommendations.",
      nextStep: "Complete the analysis actions to finalize your advisory conclusions."
    };
  }

  if (analysisStage?.status === 'available' && lawsStage?.status === 'completed') {
    return {
      stage: "Ready for Analysis",
      reasoning: "Excellent! I've established your factual foundation and legal framework. Time to analyze how the law impacts your specific situation.",
      nextStep: "I'll suggest analysis actions to apply the research to your company facts."
    };
  }

  if (lawsStage?.status === 'active') {
    return {
      stage: "Phase 2 — Codes & Regulations", 
      reasoning: "I'm conducting exhaustive legal research using a broad-to-narrow approach. Starting with general statutes, then narrowing to context-specific applications, definitions, and exemptions based on your company facts.",
      nextStep: "Complete the legal research to build the regulatory framework needed for analysis."
    };
  }

  if (lawsStage?.status === 'available' && factsStage?.status === 'completed') {
    return {
      stage: "Moving to Legal Research",
      reasoning: "Perfect! I have your company facts established. Now beginning the most critical phase - comprehensive codes & regulations research with broad-to-narrow methodology.",
      nextStep: "I'll suggest targeted legal research actions based on your specific fact pattern."
    };
  }

  if (factsStage?.status === 'active') {
    return {
      stage: "Phase 1 — Company Facts",
      reasoning: "I'm gathering facts depth-first: starting broad with industry and business model, then narrowing to specifics like product types, nexus, billing structure, and customer context.",
      nextStep: "Complete the fact-gathering to establish the foundation for comprehensive legal research."
    };
  }

  // Default - just starting
  return {
    stage: "Beginning Research Methodology",
    reasoning: "I'm initiating our structured 4-phase research approach: Company Facts → Codes & Regulations → Guidance & Opinions → Analysis. This methodology ensures comprehensive tax advisory conclusions.",
    nextStep: "Let's start with Phase 1 - gathering the key company facts that will drive our legal research."
  };
};

interface StageFilterProps {
  stage: Stage;
  isActive: boolean;
  onClick: () => void;
}

const StageFilter: React.FC<StageFilterProps> = ({ stage, isActive, onClick }) => {
  const displayText = getStageDisplayText(stage);
  const statusColor = getStageStatusColor(stage.status);

  return (
    <button
      onClick={() => stage.status !== 'locked' && onClick()}
      disabled={stage.status === 'locked'}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition border ${statusColor} ${
        isActive ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      {displayText}
    </button>
  );
};

export function AllActionsPanel({
  items,
  onAct,
  onToggleAction,
  onSelectSource,
  isTransitioning = false,
  transitionThoughts = [],
  currentThought = 0,
  recentThoughts = [],
  currentPhase,
  onPhaseChange,
}: {
  items: Recommendation[];
  onAct: (r: Recommendation) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  onSelectSource?: (sourceId: string, sourceName: string) => void;
  isTransitioning?: boolean;
  transitionThoughts?: string[];
  currentThought?: number;
  recentThoughts?: AIThought[];
  currentPhase?: AIPhase;
  onPhaseChange?: (phaseId: AIPhase['id']) => void;
}) {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("all");
  const [completedVisibility, setCompletedVisibility] = React.useState<Partial<Record<FilterKey, boolean>>>({});
  const [showRecentThinking, setShowRecentThinking] = React.useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPhaseDropdown(false);
      }
    };

    if (showPhaseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPhaseDropdown]);

  // Define available phases for the dropdown
  const availablePhases: { id: AIPhase['id']; name: string; description: string }[] = [
    { id: 'facts', name: 'Phase 1 — Company Facts', description: 'Gather broad facts, then narrow to specifics' },
    { id: 'laws', name: 'Phase 2 — Codes & Regulations', description: 'Broad-to-narrow legal research' },
    { id: 'analysis', name: 'Phase 3 — Analysis', description: 'Synthesize law with company facts' },
  ];

  const categoryStats = React.useMemo(() => {
    const base: Record<Recommendation["category"], { total: number; completed: number }> = {
      facts: { total: 0, completed: 0 },
      laws: { total: 0, completed: 0 },
      analysis: { total: 0, completed: 0 },
    };

    for (const item of items) {
      const bucket = base[item.category];
      bucket.total += 1;
      if (item.status === "closed") {
        bucket.completed += 1;
      }
    }

    return base;
  }, [items]);

  const stages: Stage[] = React.useMemo(() => {
    return CATEGORY_ORDER.map((category) => {
      const stats = categoryStats[category];
      const status = getStageStatus(category, stats, categoryStats);
      const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      return {
        key: category,
        label: CATEGORY_LABELS[category],
        status,
        completedCount: stats.completed,
        totalCount: stats.total,
        completionRate,
      };
    });
  }, [categoryStats]);

  // Keep "all" filter alongside stages
  const allFilter = {
    key: "all" as FilterKey,
    label: "All",
    total: items.length,
    completed: categoryStats.facts.completed + categoryStats.laws.completed + categoryStats.analysis.completed,
  };

  const activeCategory = activeFilter === "all" ? null : activeFilter;
  const filteredItems = React.useMemo(
    () => (activeCategory ? items.filter((item) => item.category === activeCategory) : items),
    [items, activeCategory]
  );

  const openItems = filteredItems.filter((entry) => entry.status !== "closed");
  const completedItems = filteredItems.filter((entry) => entry.status === "closed");
  const showCompleted = completedVisibility[activeFilter] ?? false;

  const toggleCompletedSection = React.useCallback((filter: FilterKey) => {
    setCompletedVisibility((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  }, []);

  return (
    <div className="h-full space-y-3 overflow-y-auto px-3 py-2">
      {/* AI Reasoning Card - Enhanced with strategic & tactical thinking */}
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-3">
        {/* Current Phase Strategy (always visible) */}
        <div className="flex items-start gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-bold">10X</span>
            {/* Enhanced pulsing ring animation when transitioning */}
            <div className={`absolute inset-0 rounded-full bg-primary/20 ${isTransitioning ? 'animate-ping' : 'animate-pulse'}`}></div>
          </div>
          <div className="flex-1 space-y-1.5">
            {isTransitioning ? (
              /* Transition State - Show AI thinking process */
              <>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-primary">
                    AI Strategy • Thinking...
                  </div>
                  {/* More intense thinking dots during transition */}
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-foreground">
                  {transitionThoughts[currentThought] || "Processing..."}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <span>Analyzing next steps...</span>
                </div>
              </>
            ) : (
              /* Normal State - Show strategic phase reasoning */
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Phase Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>{currentPhase ? currentPhase.name : getAIStageDescription(stages).stage}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${showPhaseDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showPhaseDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-border rounded-md shadow-lg z-10">
                          {availablePhases.map((phase) => (
                            <button
                              key={phase.id}
                              onClick={() => {
                                onPhaseChange?.(phase.id);
                                setShowPhaseDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50 first:rounded-t-md last:rounded-b-md ${
                                currentPhase?.id === phase.id ? 'bg-primary/10 text-primary' : 'text-gray-700'
                              }`}
                            >
                              <div className="font-medium">{phase.name}</div>
                              <div className="text-gray-500 mt-0.5">{phase.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Thinking dots animation */}
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse"></div>
                      <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-foreground">
                  {currentPhase ? currentPhase.reasoning : getAIStageDescription(stages).reasoning}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/40"></div>
                  <span>{getAIStageDescription(stages).nextStep}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expandable Recent Thinking (tactical level) */}
        {recentThoughts.length > 0 && (
          <div className="mt-3 border-t border-primary/10 pt-3">
            <button 
              onClick={() => setShowRecentThinking(!showRecentThinking)}
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Brain className="h-3 w-3" />
              Recent AI thoughts ({recentThoughts.length})
              <ChevronDown className={`h-3 w-3 transition-transform ${showRecentThinking ? 'rotate-180' : ''}`} />
            </button>
            
            {showRecentThinking && (
              <div className="mt-2 space-y-2">
                {recentThoughts.slice(0, 3).map((thought, index) => (
                  <div key={thought.id} className="rounded border border-primary/10 bg-primary/5 p-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-primary">
                          {thought.trigger}
                        </div>
                        <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                          {thought.reasoning}
                        </div>
                        {thought.actionCreated && (
                          <div className="mt-1 text-xs text-green-600">
                            → Created: {thought.actionCreated}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground">
          {isTransitioning ? "Preparing actions..." : "No actions queued. Ask Sidekick for the next move when ready."}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* All filter */}
            <button
              key="all"
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{allFilter.label}</span>
              <span className="text-[10px] font-semibold opacity-80">
                {allFilter.completed}/{allFilter.total}
              </span>
            </button>

            {/* Stage filters with progressive disclosure */}
            {stages
              .filter(stage => stage.status !== 'locked' || stage.totalCount > 0)
              .map((stage) => {
                const isActive = activeFilter === stage.key;
                return (
                  <StageFilter
                    key={stage.key}
                    stage={stage}
                    isActive={isActive}
                    onClick={() => stage.status !== 'locked' && setActiveFilter(stage.key)}
                  />
                );
              })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              Nothing queued here yet. Choose another filter or ask Sidekick for more help.
            </div>
          ) : (
            <>
              {openItems.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  {completedItems.length === filteredItems.length
                    ? "Everything in this view is completed. Expand the history below to review."
                    : "No active actions in this view yet."}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {openItems.map((entry) => (
                    <ActionCard key={entry.id} entry={entry} onAct={onAct} onToggleAction={onToggleAction} onSelectSource={onSelectSource} />
                  ))}
                </div>
              )}

              {completedItems.length > 0 && (
                <div className="rounded-md border border-muted/60 bg-muted/20 px-3 py-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground"
                    onClick={() => toggleCompletedSection(activeFilter)}
                  >
                    <span>Completed ({completedItems.length})</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCompleted ? "rotate-180" : ""}`} />
                  </button>
                  {showCompleted && (
                    <div className="mt-2 space-y-1.5">
                      {completedItems.map((entry) => (
                        <ActionCard key={entry.id} entry={entry} onAct={onAct} onToggleAction={onToggleAction} onSelectSource={onSelectSource} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ActionCard({
  entry,
  onAct,
  onToggleAction,
  onSelectSource,
}: {
  entry: Recommendation;
  onAct: (r: Recommendation) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  onSelectSource?: (sourceId: string, sourceName: string) => void;
}) {
  const isClosed = entry.status === "closed";
  const actionType = ACTION_INTENT_MAP[entry.intent];
  const meta = TYPE_META[actionType];
  const attachments = React.useMemo(() => entry.attachments ?? [], [entry.attachments]);
  const infoInstructions = entry.instructions ?? entry.summary ?? DEFAULT_INFO_PROMPT;
  const bodyCopy = infoInstructions; // Always use the instructions/summary as the main description
  const completionHint =
    actionType === "information"
      ? "Completes once the requested info appears in your draft or uploads."
      : "Completes when the output is generated; the button or your own draft both count.";

  const [expanded, setExpanded] = React.useState(false);
  const [localAttachments, setLocalAttachments] = React.useState<RecommendationAttachment[]>([]);
  
  // Initialize local attachments with existing attachments
  React.useEffect(() => {
    const initialAttachments = [...(attachments || [])];
    // If there are suggested attachments, add them as "ready to attach"
    if (entry.suggestedAttachments && entry.suggestedAttachments.length > 0) {
      initialAttachments.push(...entry.suggestedAttachments);
    }
    setLocalAttachments(initialAttachments);
  }, [attachments, entry.suggestedAttachments]);

  const toggleExpanded = React.useCallback(() => setExpanded((prev) => !prev), []);
  
  const handleAddFiles = React.useCallback(() => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        const newAttachments: RecommendationAttachment[] = Array.from(files).map((file, index) => ({
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          kind: 'file' as const,
        }));
        setLocalAttachments(prev => [...prev, ...newAttachments]);
      }
    };
    
    input.click();
  }, []);

  const handleRemoveFile = React.useCallback((fileId: string) => {
    setLocalAttachments(prev => prev.filter(att => att.id !== fileId));
  }, []);
  const handleCardKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleExpanded();
      }
    },
    [toggleExpanded]
  );

  const detailClasses =
    "space-y-3 rounded-md border border-dashed border-muted/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground";

  const userGeneratedFiles = React.useMemo<RecommendationAttachment[]>(
    () => [
      ...localAttachments.map((attachment) => ({
        ...attachment,
        id: attachment.id ?? attachment.name,
        kind: attachment.kind ?? "file",
      })),
    ],
    [localAttachments]
  );

  const hasSelections = userGeneratedFiles.length > 0;

  const primaryCtaLabel = React.useMemo(() => {
    if (actionType !== "information") {
      return "Generate";
    }
    if (userGeneratedFiles.length === 0) {
      return "Upload File";
    }
    if (hasSelections) {
      return "Attach to Project";
    }
    return "Attach Selected Files";
  }, [actionType, hasSelections, userGeneratedFiles.length]);

  const handlePrimaryAction = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (actionType === "information") {
        const payload: Recommendation = {
          ...entry,
          attachments: userGeneratedFiles,
        };
        onAct(payload);
      } else {
        onAct(entry);
      }
    },
    [actionType, entry, onAct, userGeneratedFiles]
  );

  let collapsedLabel = "";
  if (!expanded) {
    if (actionType === "information") {
      const pieces: string[] = [];
      if (userGeneratedFiles.length > 0) {
        pieces.push(`${userGeneratedFiles.length} file${userGeneratedFiles.length === 1 ? "" : "s"}`);
      } else {
        pieces.push("0 files found");
      }
      collapsedLabel = pieces.join(" | ");
    } else {
      collapsedLabel =
        userGeneratedFiles.length === 0
          ? "View details"
          : `${userGeneratedFiles.length} source${userGeneratedFiles.length === 1 ? "" : "s"}`;
    }
  } else {
    // When expanded, show the same contextual info
    if (actionType === "information") {
      const pieces: string[] = [];
      if (userGeneratedFiles.length > 0) {
        pieces.push(`${userGeneratedFiles.length} file${userGeneratedFiles.length === 1 ? "" : "s"}`);
      } else {
        pieces.push("0 files found");
      }
      collapsedLabel = pieces.join(" | ");
    } else {
      collapsedLabel =
        userGeneratedFiles.length === 0
          ? "View details"
          : `${userGeneratedFiles.length} source${userGeneratedFiles.length === 1 ? "" : "s"}`;
    }
  }

  const userFilesLabel = actionType === "information" ? "Files" : "Sources";
  const emptyUserFilesCopy =
    actionType === "information" ? "No files selected" : "No sources attached";

  const attachmentsList = actionType === "information" ? userGeneratedFiles : attachments;

  return (
    <div
      className={`w-full rounded-md border border-muted/60 px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        isClosed ? "bg-muted/30" : "bg-background hover:bg-muted/30"
      }`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={toggleExpanded}
      onKeyDown={handleCardKeyDown}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-medium uppercase">{meta.label}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="grid h-4 w-4 place-items-center rounded-full border border-muted-foreground/20 text-muted-foreground/80 transition hover:text-foreground"
                    aria-label="How this action completes"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-[220px] px-2 py-1.5 text-xs">
                  {completionHint}
                </TooltipContent>
              </Tooltip>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAct(entry);
              }}
              className="block w-full truncate text-left text-sm font-semibold text-foreground hover:underline"
            >
              {entry.title}
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                onToggleAction(entry.id, true);
              }}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span 
            className="flex items-center gap-1 font-semibold text-primary cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
          >
            {collapsedLabel}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </span>
          <div className="flex items-center gap-2">
            {!isClosed && !expanded && (
              <>
                {actionType === "information" ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAddFiles();
                      }} 
                      className="h-7 px-3 text-xs"
                    >
                      Add More Files
                    </Button>
                    <Button 
                      size="sm" 
                      variant={meta.primaryVariant} 
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePrimaryAction(event);
                      }} 
                      className="h-7 px-3 text-xs"
                      disabled={userGeneratedFiles.length === 0}
                    >
                      Save Files
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant={meta.primaryVariant} 
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePrimaryAction(event);
                    }} 
                    className="h-7 px-3 text-xs"
                  >
                    {primaryCtaLabel}
                  </Button>
                )}
              </>
            )}
            {isClosed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleAction(entry.id, false);
                }}
                className="h-7 px-2 text-xs"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
            <div className={detailClasses}>
              <div className="flex items-start justify-between gap-2">
                <div className="leading-snug text-foreground flex-1">{bodyCopy}</div>
                {/* AI Reasoning Icon - Top Right of Description */}
                {entry.aiReasoning && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="grid h-4 w-4 place-items-center rounded-full text-primary/70 transition hover:text-primary cursor-help shrink-0 mt-0.5"
                        aria-label="Why 10X suggested this action"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Brain className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" className="max-w-[280px] p-3 bg-white border border-border shadow-lg">
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-900">
                          {entry.aiReasoning.trigger}
                        </div>
                        <div className="text-xs text-gray-600 leading-snug">
                          {entry.aiReasoning.reasoning}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground/70">{userFilesLabel}</div>
                {attachmentsList.length === 0 ? (
                  <div className="text-muted-foreground/60">{emptyUserFilesCopy}</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentsList.map((attachment, index) => (
                      <div
                        key={attachment.id ?? `${attachment.name}-${index}`}
                        className="flex items-center gap-1 rounded-full border border-muted-foreground/20 px-2.5 py-1 text-xs font-medium text-primary transition hover:border-primary/40 hover:bg-primary/10 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectSource?.(attachment.id ?? attachment.name, attachment.name);
                        }}
                      >
                        <span>{attachment.name}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const fileId = attachment.id ?? `${attachment.name}-${index}`;
                            handleRemoveFile(fileId);
                          }}
                          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                          aria-label={`Remove ${attachment.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!isClosed && (
              <div className="flex items-center justify-start gap-2">
                {actionType === "information" ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAddFiles();
                      }} 
                      className="h-7 px-3 text-xs"
                    >
                      Add More Files
                    </Button>
                    <Button 
                      size="sm" 
                      variant={meta.primaryVariant} 
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePrimaryAction(event);
                      }} 
                      className="h-7 px-3 text-xs"
                      disabled={userGeneratedFiles.length === 0}
                    >
                      Save Files
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant={meta.primaryVariant} 
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePrimaryAction(event);
                    }} 
                    className="h-7 px-3 text-xs"
                  >
                    {primaryCtaLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



