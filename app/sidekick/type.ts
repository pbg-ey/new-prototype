export type RecStatus = "suggested" | "in_progress" | "evidence_added" | "ready_to_draft" | "blocked" | "closed";

export type Recommendation = {
  id: string;
  title: string;
  intent: "add_evidence" | "draft" | "re_analyze" | "re_score" | "housekeeping";
  priority: "high" | "med" | "low";
  status: RecStatus;
  context?: { section?: string; issue?: string; jurisdictions?: string[] };
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
