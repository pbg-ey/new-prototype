export type RecStatus = "suggested" | "in_progress" | "evidence_added" | "ready_to_draft" | "blocked" | "closed";

export type RecommendationAttachment = {
  id: string;
  name: string;
  kind?: "source" | "note" | "file";
};

export type Recommendation = {
  id: string;
  title: string;
  intent: "add_evidence" | "draft" | "re_analyze" | "re_score" | "housekeeping";
  priority?: "high" | "med" | "low";
  category: "facts" | "laws" | "analysis";
  status: RecStatus;
  summary?: string;
  instructions?: string;
  attachments?: RecommendationAttachment[];
  suggestedAttachments?: RecommendationAttachment[];
  context?: { section?: string; issue?: string; jurisdictions?: string[] };
  aiReasoning?: ActionReasoning; // NEW: AI reasoning for why this action was created
};

export type DocumentKind = "memo" | "email" | "draft" | "explanation" | "matrix";

export type MatrixCell = {
  value: string;
  citations?: string;
};

export type MatrixRow = {
  question: string;
  cells: MatrixCell[];
};

export type MatrixDocument = {
  jurisdictions: string[];
  rows: MatrixRow[];
};

export type ProjectDocument = {
  id: string;
  name: string;
  kind: DocumentKind;
  content?: string;
  matrix?: MatrixDocument;
  createdAt: string;
  updatedAt: string;
};

export type CitationFinding = {
  id: string;
  citation: string;
  veracity: number;
  pertinence: number;
  risk: number;
  signals: string[];
};

export type SourceCategory = "facts" | "laws" | "explanations" | "prior";

export type SourceItem = {
  id: string;
  name: string;
  kind: "pdf" | "doc" | "other";
  category: SourceCategory;
  addedAt: string;
  tags?: string[];
  href?: string;
  missing?: boolean;
  origin?: "upload" | "link";
  preview?: string;
};

export type IssueType = "missing_detail" | "placeholder_language" | "unsupported_comparison";

export type ValidationIssue = {
  id: string;
  title: string;
  type: IssueType;
  severity: "high" | "med" | "low";
  section: string;
  excerpt: string;
  findPattern: string;
  fixOptions: string[];
  autoFix?: string;
  sourceId?: string;
  sourceExcerpt?: string;
};

// 🧠 AI REASONING SYSTEM TYPES

export type AIPhaseId = 'facts' | 'laws' | 'analysis';

export interface AIPhase {
  id: AIPhaseId;
  name: string;
  number: number;
  description: string;
  reasoning: string;
  status: 'pending' | 'active' | 'completed';
}

export interface AIThought {
  id: string;
  timestamp: Date;
  phase: AIPhaseId;
  trigger: string; // What caused this thinking
  reasoning: string; // The AI's analysis
  actionCreated?: string; // Title of action created (if any)
  context?: {
    userAction?: string;
    dataChanged?: string;
    gap?: string;
  };
}

export interface ActionReasoning {
  trigger: string; // "User completed fact-gathering about sales operations"
  reasoning: string; // "I need to understand the sales tax nexus implications..."
  thoughtId: string; // Links back to the AI thought that created this
}

// Enhanced Recommendation type with AI reasoning
export type RecommendationWithReasoning = Recommendation & {
  aiReasoning?: ActionReasoning;
};

