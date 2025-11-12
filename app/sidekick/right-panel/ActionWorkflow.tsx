'use client';
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
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

type WorkflowStage = "sources" | "generation" | "validation";
type StageStatus = "pending" | "active" | "completed" | "error";

interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  category: "facts" | "laws" | "analysis";
  currentStage: WorkflowStage;
  stageStatuses: Record<WorkflowStage, StageStatus>;
  sources: WorkflowSource[];
  generatedContent?: GeneratedContent;
  validationResults?: ValidationResult[];
  estimatedDuration: string;
  priority: "high" | "medium" | "low";
  aiReasoning?: {
    trigger: string;
    reasoning: string;
  };
}

interface AIThoughtStep {
  id: string;
  timestamp: string;
  type: "analysis" | "decision" | "reasoning" | "context";
  title: string;
  content: string;
  confidence?: number;
  relatedActions?: string[];
}

interface AIInsightData {
  workflowId: string;
  sessionStart: string;
  overallStrategy: string;
  thoughtHistory: AIThoughtStep[];
  currentFocus: string;
  nextSteps: string[];
}

interface PhaseInsight {
  goal: string;
  approach: string;
  alignment: string;
  keyTasks: string[];
}

interface WorkflowSource {
  id: string;
  name: string;
  type: "upload" | "search" | "api" | "manual";
  status: "pending" | "uploading" | "ready" | "error";
  size?: string;
  uploadProgress?: number;
}

interface GeneratedContent {
  id: string;
  content: string;
  type: "summary" | "analysis" | "recommendation";
  generatedAt: Date;
  wordCount: number;
  confidence: number;
}

interface ValidationResult {
  id: string;
  type: "accuracy" | "completeness" | "compliance" | "quality";
  status: "pass" | "warning" | "fail";
  message: string;
  severity: "low" | "medium" | "high";
}



const MOCK_ACTIONS: WorkflowAction[] = [
  // Company Facts Actions
  {
    id: "facts-1",
    title: "Business Model Documentation",
    description: "Document core business operations, revenue streams, and organizational structure for tax analysis foundation.",
    category: "facts",
    currentStage: "validation",
    stageStatuses: {
      sources: "completed",
      generation: "completed",
      validation: "active"
    },
    sources: [
      {
        id: "source-1",
        name: "Business Plan 2024.pdf",
        type: "upload",
        status: "ready",
        size: "1.2 MB"
      },
      {
        id: "source-2", 
        name: "Org Chart & Subsidiaries.xlsx",
        type: "upload",
        status: "ready",
        size: "340 KB"
      }
    ],
    generatedContent: {
      id: "gen-1",
      content: "TechCorp operates a multi-tiered SaaS business model with primary revenue from subscription services across 12 states...",
      type: "summary",
      generatedAt: new Date(Date.now() - 180000),
      wordCount: 567,
      confidence: 0.94
    },
    validationResults: [
      {
        id: "val-1",
        type: "accuracy",
        status: "pass",
        message: "Business model details confirmed with management",
        severity: "low"
      }
    ],
    estimatedDuration: "8-10 min",
    priority: "high",
    aiReasoning: {
      trigger: "Business foundation analysis needed",
      reasoning: "I identified that understanding your core business model is essential before proceeding with tax research. Without clear documentation of revenue streams, entity structure, and operational scope, subsequent legal research would lack the necessary factual foundation to provide accurate tax guidance."
    }
  },
  {
    id: "facts-2",
    title: "Revenue & Transaction Analysis",
    description: "Analyze transaction patterns, customer geography, and billing structures to determine tax nexus requirements.",
    category: "facts",
    currentStage: "generation",
    stageStatuses: {
      sources: "completed",
      generation: "active",
      validation: "pending"
    },
    sources: [
      {
        id: "source-3",
        name: "2024 Revenue Data.csv",
        type: "upload",
        status: "ready",
        size: "2.8 MB"
      },
      {
        id: "source-4",
        name: "Customer Database Export",
        type: "api",
        status: "ready",
        size: "1.9 MB"
      }
    ],
    generatedContent: {
      id: "gen-2",
      content: "Analysis shows 73% of revenue from multi-state customers with significant nexus implications in CA, NY, TX...",
      type: "analysis",
      generatedAt: new Date(),
      wordCount: 892,
      confidence: 0.88
    },
    estimatedDuration: "12-15 min",
    priority: "high",
    aiReasoning: {
      trigger: "Nexus determination requires transaction analysis",
      reasoning: "Based on your SaaS business model, I need to analyze where your customers are located and how you deliver services. This transaction pattern analysis is crucial for determining which states you have tax nexus in, directly impacting your compliance obligations."
    }
  },
  {
    id: "facts-3",
    title: "Operational Footprint Mapping",
    description: "Map physical presence, employee locations, and business activities by jurisdiction for comprehensive nexus analysis.",
    category: "facts", 
    currentStage: "sources",
    stageStatuses: {
      sources: "active",
      generation: "pending",
      validation: "pending"
    },
    sources: [
      {
        id: "source-5",
        name: "Employee Location Data.xlsx",
        type: "upload",
        status: "ready",
        size: "450 KB"
      }
    ],
    estimatedDuration: "6-8 min",
    priority: "medium",
    aiReasoning: {
      trigger: "Physical presence creates additional nexus considerations",
      reasoning: "Beyond customer locations, your employee presence and business activities in different jurisdictions create additional nexus implications. Mapping this operational footprint ensures we capture all potential tax obligations, not just those from customer transactions."
    }
  },

  // Laws & Regulations Actions
  {
    id: "laws-1",
    title: "Multi-State Sales Tax Research",
    description: "Research sales tax obligations across all states with customer presence, including economic nexus thresholds.",
    category: "laws",
    currentStage: "sources",
    stageStatuses: {
      sources: "active",
      generation: "pending",
      validation: "pending"
    },
    sources: [
      {
        id: "source-6",
        name: "State Sales Tax Matrix.pdf",
        type: "search",
        status: "ready",
        size: "2.1 MB"
      },
      {
        id: "source-7",
        name: "Economic Nexus Thresholds 2024",
        type: "api",
        status: "pending"
      }
    ],
    estimatedDuration: "18-25 min",
    priority: "high",
    aiReasoning: {
      trigger: "Facts analysis revealed multi-state customer base",
      reasoning: "Now that I understand your customer geography and transaction patterns from the facts phase, I need to research the specific tax obligations in each relevant jurisdiction. This comprehensive state-by-state analysis will identify your exact compliance requirements and registration thresholds."
    }
  },
  {
    id: "laws-2",
    title: "Federal Tax Code Analysis",
    description: "Analyze IRC sections relevant to SaaS businesses, including Section 199A deduction opportunities and international provisions.",
    category: "laws",
    currentStage: "generation",
    stageStatuses: {
      sources: "completed",
      generation: "active",
      validation: "pending"
    },
    sources: [
      {
        id: "source-8",
        name: "IRC Section 199A Analysis.pdf",
        type: "api",
        status: "ready",
        size: "1.5 MB"
      }
    ],
    generatedContent: {
      id: "gen-3",
      content: "Section 199A qualified business income deduction applies to SaaS operations with specific limitations for service businesses...",
      type: "analysis",
      generatedAt: new Date(),
      wordCount: 1156,
      confidence: 0.91
    },
    estimatedDuration: "15-20 min",
    priority: "medium",
    aiReasoning: {
      trigger: "SaaS business model suggests federal tax opportunities",
      reasoning: "Your SaaS business structure presents potential opportunities under Section 199A and other federal provisions. I'm analyzing these opportunities while you're gathering facts, as understanding available deductions will influence our overall tax strategy recommendations."
    }
  },

  // Analysis & Recommendations Actions 
  {
    id: "analysis-1",
    title: "Tax Optimization Strategy",
    description: "Synthesize facts and law to develop comprehensive tax optimization recommendations for current and future operations.",
    category: "analysis",
    currentStage: "sources",
    stageStatuses: {
      sources: "pending",
      generation: "pending",
      validation: "pending"
    },
    sources: [],
    estimatedDuration: "20-30 min",
    priority: "high",
    aiReasoning: {
      trigger: "Ready to synthesize factual and legal research",
      reasoning: "Once we complete the facts and laws phases, I'll synthesize all findings to develop a comprehensive tax optimization strategy. This will include specific recommendations for compliance, planning opportunities, and operational adjustments to minimize your overall tax burden while ensuring full compliance."
    }
  }
];

const MOCK_AI_INSIGHTS: AIInsightData = {
  workflowId: "tax-optimization-2024",
  sessionStart: "2024-11-12T14:30:00Z",
  overallStrategy: "Multi-jurisdictional tax optimization focusing on nexus analysis and federal opportunities",
  currentFocus: "Establishing baseline facts before legal research phase",
  nextSteps: [
    "Complete business model documentation",
    "Analyze multi-state nexus requirements", 
    "Research federal tax optimization opportunities",
    "Synthesize comprehensive strategy"
  ],
  thoughtHistory: [
    {
      id: "thought-1",
      timestamp: "2024-11-12T14:30:15Z",
      type: "analysis",
      title: "Initial Tax Situation Assessment",
      content: "Analyzing user's multi-state business operations. Detected potential nexus issues in 3 states and significant federal tax planning opportunities. Prioritizing fact-gathering to establish solid foundation before legal research.",
      confidence: 95
    },
    {
      id: "thought-2", 
      timestamp: "2024-11-12T14:31:22Z",
      type: "decision",
      title: "Workflow Strategy Selection",
      content: "Chose Facts → Laws → Analysis progression over other approaches. This sequential method ensures comprehensive coverage and reduces risk of missing critical compliance requirements.",
      confidence: 88,
      relatedActions: ["facts-1", "facts-2"]
    },
    {
      id: "thought-3",
      timestamp: "2024-11-12T14:32:45Z", 
      type: "reasoning",
      title: "Business Model Documentation Priority",
      content: "Elevating business model documentation as first action. Without clear understanding of revenue streams and operational structure, subsequent legal analysis would be incomplete. This creates foundation for all downstream decisions.",
      confidence: 92,
      relatedActions: ["facts-1"]
    },
    {
      id: "thought-4",
      timestamp: "2024-11-12T14:33:18Z",
      type: "context",
      title: "Multi-State Complexity Detection", 
      content: "Identified operations spanning multiple jurisdictions. This triggers need for comprehensive nexus analysis before proceeding with optimization strategies. Each state has unique thresholds and requirements.",
      confidence: 90,
      relatedActions: ["facts-2", "laws-1"]
    },
    {
      id: "thought-5",
      timestamp: "2024-11-12T14:34:02Z",
      type: "decision", 
      title: "Federal Opportunities Identification",
      content: "Detecting potential for significant federal tax benefits based on business profile. R&D credits, depreciation strategies, and entity structure optimization all show promise. Queuing for detailed analysis after facts phase.",
      confidence: 85,
      relatedActions: ["laws-2", "analysis-1"]
    },
    {
      id: "thought-6",
      timestamp: "2024-11-12T14:35:30Z",
      type: "reasoning",
      title: "Progressive Validation Approach",
      content: "Implementing stage-gate validation to prevent compounding errors. Each facts-gathering phase requires validation before proceeding to legal research. This ensures accuracy and builds confidence in final recommendations.",
      confidence: 94
    }
  ]
};

const PHASE_INSIGHTS: Record<"facts" | "laws" | "analysis", PhaseInsight> = {
  facts: {
    goal: "Build an authoritative factual foundation before interpreting tax obligations.",
    approach: "Depth-first discovery that starts with the business model, then quantifies customer and operational footprint to surface every nexus trigger.",
    alignment: "These actions make sure every downstream legal interpretation is anchored in verified operational reality.",
    keyTasks: [
      "Document how the business operates, generates revenue, and is structured.",
      "Analyze customer geography and transactions to detect economic nexus thresholds.",
      "Map physical presence and employee activity that create additional filing requirements."
    ]
  },
  laws: {
    goal: "Translate the factual footprint into concrete statutory requirements and opportunities.",
    approach: "Broad-to-narrow research that starts with multi-state obligations before drilling into federal optimization levers.",
    alignment: "Each action pairs the factual findings with the most impactful laws, so nothing material is missed when we synthesize guidance.",
    keyTasks: [
      "Confirm sales and use tax duties in every implicated jurisdiction.",
      "Capture registrations, thresholds, and compliance cadence per state.",
      "Identify federal code sections that unlock planning opportunities or risk exposure."
    ]
  },
  analysis: {
    goal: "Synthesize facts and statutes into an execution-ready tax optimization plan.",
    approach: "Structure insights into prioritized recommendations, implementation steps, and monitoring checkpoints.",
    alignment: "Actions here convert all prior research into clear guidance your team can execute and defend.",
    keyTasks: [
      "Aggregate validated facts and legal findings into a coherent narrative.",
      "Design mitigation and optimization strategies matched to identified obligations.",
      "Outline operational adjustments, timelines, and ownership for implementation."
    ]
  }
};

export function ActionWorkflow() {
  const [actions, setActions] = React.useState<WorkflowAction[]>(MOCK_ACTIONS);
  const [expandedAction, setExpandedAction] = React.useState<string | null>("action-1");
  const [activeCategory, setActiveCategory] = React.useState<"facts" | "laws" | "analysis">("facts");
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [commandInput, setCommandInput] = React.useState("");
  const [showAiInsights, setShowAiInsights] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  // Calculate category progress dynamically
  const getCategoryProgress = React.useCallback((categoryId: "facts" | "laws" | "analysis") => {
    const categoryActions = actions.filter(action => action.category === categoryId);
    const completedActions = categoryActions.filter(action => 
      action.stageStatuses.validation === 'completed'
    );
    return {
      completed: completedActions.length,
      total: categoryActions.length
    };
  }, [actions]);

  // Category configuration
  const CATEGORIES = React.useMemo(() => [
    { 
      id: 'facts' as const, 
      name: 'Company Facts', 
      description: 'Gather business context and operational details',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      progress: getCategoryProgress('facts')
    },
    { 
      id: 'laws' as const, 
      name: 'Codes & Regulations', 
      description: 'Research applicable laws and regulatory requirements',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      progress: getCategoryProgress('laws')
    },
    { 
      id: 'analysis' as const, 
      name: 'Analysis & Recommendations', 
      description: 'Synthesize findings into actionable guidance',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      progress: getCategoryProgress('analysis')
    }
  ], [getCategoryProgress]);

  // Filter actions by category
  const filteredActions = React.useMemo(
    () => actions.filter(action => action.category === activeCategory),
    [actions, activeCategory]
  );

  const currentCategory = React.useMemo(
    () => CATEGORIES.find(category => category.id === activeCategory) ?? CATEGORIES[0],
    [CATEGORIES, activeCategory]
  );

  const phaseInsights = React.useMemo(() => PHASE_INSIGHTS[activeCategory], [activeCategory]);

  const phaseThoughts = React.useMemo(() => {
    const prefixMap = {
      facts: "facts-",
      laws: "laws-",
      analysis: "analysis-"
    } as const;

    const prefix = prefixMap[activeCategory];

    return MOCK_AI_INSIGHTS.thoughtHistory.filter(thought => {
      if (!thought.relatedActions || thought.relatedActions.length === 0) {
        return true;
      }

      return thought.relatedActions.some(actionId => actionId.startsWith(prefix));
    });
  }, [activeCategory]);

  // Keyboard navigation for carousel
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const currentIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : CATEGORIES.length - 1;
        setActiveCategory(CATEGORIES[prevIndex].id);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const currentIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
        const nextIndex = currentIndex < CATEGORIES.length - 1 ? currentIndex + 1 : 0;
        setActiveCategory(CATEGORIES[nextIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCategory, CATEGORIES]);



  const handleAddSource = React.useCallback((actionId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        setActions(prev => prev.map(action => {
          if (action.id !== actionId) return action;
          
          const newSources: WorkflowSource[] = Array.from(files).map((file, index) => ({
            id: `upload-${Date.now()}-${index}`,
            name: file.name,
            type: 'upload',
            status: 'uploading',
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadProgress: 0
          }));
          
          // Simulate upload progress
          newSources.forEach(source => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                clearInterval(interval);
                setActions(prev => prev.map(a => {
                  if (a.id !== actionId) return a;
                  return {
                    ...a,
                    sources: a.sources.map(s => 
                      s.id === source.id 
                        ? { ...s, status: 'ready', uploadProgress: 100 }
                        : s
                    )
                  };
                }));
              } else {
                setActions(prev => prev.map(a => {
                  if (a.id !== actionId) return a;
                  return {
                    ...a,
                    sources: a.sources.map(s => 
                      s.id === source.id 
                        ? { ...s, uploadProgress: progress }
                        : s
                    )
                  };
                }));
              }
            }, 200);
          });
          
          return {
            ...action,
            sources: [...action.sources, ...newSources]
          };
        }));
      }
    };
    
    input.click();
  }, []);

  const handleGenerate = React.useCallback((actionId: string) => {
    setActions(prev => prev.map(action => {
      if (action.id !== actionId) return action;
      
      return {
        ...action,
        currentStage: 'generation',
        stageStatuses: {
          ...action.stageStatuses,
          sources: 'completed',
          generation: 'active'
        }
      };
    }));
    
    // Simulate generation process
    setTimeout(() => {
      setActions(prev => prev.map(action => {
        if (action.id !== actionId) return action;
        
        return {
          ...action,
          generatedContent: {
            id: `gen-${Date.now()}`,
            content: "AI-generated analysis content based on the provided sources...",
            type: "analysis",
            generatedAt: new Date(),
            wordCount: Math.floor(Math.random() * 2000) + 500,
            confidence: 0.85 + Math.random() * 0.1
          },
          stageStatuses: {
            ...action.stageStatuses,
            generation: 'completed'
          }
        };
      }));
    }, 3000);
  }, []);

  const handleValidate = React.useCallback((actionId: string) => {
    setActions(prev => prev.map(action => {
      if (action.id !== actionId) return action;
      
      return {
        ...action,
        currentStage: 'validation',
        stageStatuses: {
          ...action.stageStatuses,
          validation: 'active'
        }
      };
    }));
    
    // Simulate validation process
    setTimeout(() => {
      setActions(prev => prev.map(action => {
        if (action.id !== actionId) return action;
        
        const mockValidations: ValidationResult[] = [
          {
            id: `val-${Date.now()}-1`,
            type: "accuracy",
            status: "pass", 
            message: "Content accuracy verified against source materials",
            severity: "low"
          },
          {
            id: `val-${Date.now()}-2`,
            type: "completeness",
            status: Math.random() > 0.5 ? "pass" : "warning",
            message: Math.random() > 0.5 
              ? "All required elements present" 
              : "Some additional context recommended",
            severity: "medium"
          }
        ];
        
        return {
          ...action,
          validationResults: mockValidations,
          stageStatuses: {
            ...action.stageStatuses,
            validation: 'completed'
          }
        };
      }));
    }, 2000);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-2">
        {/* Compact Carousel */}
        <div className="relative">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => {
              const currentIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : CATEGORIES.length - 1;
              setActiveCategory(CATEGORIES[prevIndex].id);
            }}
            className="shrink-0 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
            aria-label="Previous phase"
          >
            <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-800 rotate-180" />
          </button>

          {/* Compact Category Card */}
          <div className="flex-1 min-w-0 relative" ref={dropdownRef}>
            {(() => {
              const currentCategory = CATEGORIES.find(c => c.id === activeCategory)!;
              const isCompleted = currentCategory.progress.completed === currentCategory.progress.total;
              const progressPercent = currentCategory.progress.total > 0 
                ? Math.round((currentCategory.progress.completed / currentCategory.progress.total) * 100) 
                : 0;

              return (
                <div className="rounded-lg border bg-gray-50 hover:bg-gray-100 transition-all p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span>{currentCategory.name}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{progressPercent}%</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {!isCompleted && <RefreshCw className="h-4 w-4 text-gray-400 animate-pulse" />}
                    </div>
                  </div>
                  
                  {/* Embedded Dropdown Menu */}
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                            activeCategory === category.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{category.name}</div>
                          <div className="text-gray-500 mt-0.5">{category.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Next Button */}
          <button
            onClick={() => {
              const currentIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
              const nextIndex = currentIndex < CATEGORIES.length - 1 ? currentIndex + 1 : 0;
              setActiveCategory(CATEGORIES[nextIndex].id);
            }}
            className="shrink-0 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
            aria-label="Next phase"
          >
            <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-800" />
          </button>
        </div>

        {/* Compact Carousel Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            const isCompleted = category.progress.completed === category.progress.total && category.progress.total > 0;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`h-1.5 rounded-full transition-all ${
                  isActive 
                    ? 'w-4 bg-gray-600' 
                    : isCompleted
                    ? 'w-1.5 bg-green-500'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to ${category.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* Actions & AI Insights Overlay */}
  <div className="relative min-h-80 overflow-hidden">
        <div
          className={`space-y-2 transition-opacity duration-300 ${
            showAiInsights ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {filteredActions.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted/60 bg-muted/20 p-6 text-center">
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-foreground">No actions in this phase yet</p>
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
                onToggleExpanded={() => setExpandedAction(
                  expandedAction === action.id ? null : action.id
                )}
                onAddSource={handleAddSource}
                onGenerate={handleGenerate}
                onValidate={handleValidate}
              />
            ))
          )}
        </div>

        <div
          className={`absolute inset-0 z-20 transform border border-blue-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            showAiInsights ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'
          }`}
        >
          <div className="flex flex-col h-full rounded-t-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/80 backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Brain className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">AI Strategic Insights</p>
                  <p className="text-xs text-blue-600">
                    {currentCategory?.name ?? 'Current Phase'}
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

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Phase Objective
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {phaseInsights.goal}
                </p>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  {phaseInsights.alignment}
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  AI Approach
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed">
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
              </section>

              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Thought Process
                </h4>
                <div className="space-y-3">
                  {phaseThoughts.slice(0, 5).map((thought) => (
                    <div key={thought.id} className="rounded-lg border border-blue-100 bg-blue-50/80 p-3">
                      <div className="flex items-start gap-2">
                        <div className={`shrink-0 h-6 w-6 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                          thought.type === 'decision'
                            ? 'bg-blue-600 text-white'
                            : thought.type === 'analysis'
                            ? 'bg-green-600 text-white'
                            : thought.type === 'reasoning'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-400 text-white'
                        }`}>
                          {thought.type === 'decision'
                            ? '!'
                            : thought.type === 'analysis'
                            ? 'A'
                            : thought.type === 'reasoning'
                            ? 'R'
                            : 'C'}
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
                            {new Date(thought.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <div key={action.id} className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-blue-900">
                          {action.title}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {action.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                        {action.aiReasoning?.reasoning ?? 'This action supports the overall workflow progression for this phase.'}
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
                    <li key={`${step}-${index}`} className="rounded-md border border-blue-100 bg-white/80 p-3">
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

    {/* AI Insights Button */}
      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAiInsights(!showAiInsights)}
          aria-label={showAiInsights ? 'Close AI insights overlay' : 'Open AI insights overlay'}
          className={`h-8 w-8 rounded-full transition-colors ${
            showAiInsights
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          {showAiInsights ? <X className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />}
        </Button>
      </div>

  {/* Command Bar */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Create new action... (e.g., Research Delaware tax requirements)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commandInput.trim()) {
                  // TODO: Add create action functionality
                  console.log('Create action:', commandInput.trim());
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
                console.log('Create action:', commandInput.trim());
                setCommandInput("");
              }
            }}
          >
            Create
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>💡 Try: &ldquo;Analyze Section 199A deduction eligibility&rdquo;</span>
          <span>•</span>
          <span>⚡ Quick add with Enter</span>
        </div>
      </div>

    </div>
  );
}

function ActionWorkflowCard({
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