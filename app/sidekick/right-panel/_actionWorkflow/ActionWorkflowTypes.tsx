type WorkflowStage = "sources" | "generation" | "validation";
type StageStatus = "pending" | "active" | "completed" | "error";

export interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  // Allow dynamic user-added categories beyond initial union
  category: string;
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
  sourceAnalysis?: SourceAnalysis;
  needsUserSources?: boolean;
}

export interface AIThoughtStep {
  id: string;
  timestamp: string;
  type: "analysis" | "decision" | "reasoning" | "context";
  title: string;
  content: string;
  confidence?: number;
  relatedActions?: string[];
}

export interface AIInsightData {
  workflowId: string;
  sessionStart: string;
  overallStrategy: string;
  thoughtHistory: AIThoughtStep[];
  currentFocus: string;
  nextSteps: string[];
}

export interface PhaseInsight {
  goal: string;
  approach: string;
  alignment: string;
  keyTasks: string[];
}

export interface SourceAnalysis {
  id: string;
  status: 'analyzing' | 'sufficient' | 'insufficient' | 'irrelevant';
  confidence: number;
  relevanceScore: number;
  gaps?: string[];
  recommendations?: string[];
  analyzedAt: Date;
}

export interface WorkflowSource {
  id: string;
  name: string;
  type: "upload" | "search" | "api" | "manual";
  status: "pending" | "uploading" | "ready" | "error";
  size?: string;
  uploadProgress?: number;
  analysis?: SourceAnalysis;
}

export interface GeneratedContent {
  id: string;
  content: string;
  type: "summary" | "analysis" | "recommendation";
  generatedAt: Date;
  wordCount: number;
  confidence: number;
}

export interface ValidationResult {
  id: string;
  type: "accuracy" | "completeness" | "compliance" | "quality";
  status: "pass" | "warning" | "fail";
  message: string;
  severity: "low" | "medium" | "high";
}

export interface AiAnalysisState {
  isAnalyzing: boolean;
  analysisType: 'actions' | 'phases' | 'both';
  progress: number;
  currentStep: string;
  startedAt: Date;
}

export interface PhaseRecommendation {
  id: string;
  suggestedName: string;
  suggestedDescription: string;
  reasoning: string;
  confidence: number;
  requiredActions: string[];
  createdAt: Date;
}

export interface AiNotification {
  id: string;
  type: 'phase_suggestion' | 'actions_updated' | 'analysis_complete' | 'info';
  title: string;
  message: string;
  actionable?: boolean;
  data?: PhaseRecommendation;
  createdAt: Date;
  dismissed?: boolean;
}
