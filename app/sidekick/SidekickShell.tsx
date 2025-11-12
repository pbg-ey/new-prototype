"use client";

import * as React from "react";
import {
  Bold,
  ChevronLeft,
  Heading2,
  Italic,
  List,
  Lightbulb,
  PanelLeft,
  PanelLeftOpen,
  PanelRight,
  PanelRightOpen,
  Paperclip,
  Save,
  Sparkles,
  Trash2,
  ExternalLink,
  Link2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Recommendation,
  SourceItem,
  SourceCategory,
  ValidationIssue,
  ProjectDocument,
  DocumentKind,
  MatrixDocument,
  AIThought,
  AIPhase,
} from "./type";
import dynamic from "next/dynamic";
import type { EditorHandle } from "./editor/SimpleEditor";
import { LibrarySidebar } from "./library/LibrarySidebar";
import { useAutoScroll } from "./utils/ui";
import { AllActionsPanel } from "./right-panel/ActionsPanel";
import { ValidatePanel } from "./right-panel/ValidatePanel";
import { ActionWorkflow } from "./right-panel/ActionWorkflow";
import { Bubble } from "./right-panel/_shared/Bubble";
import { EditCard } from "./right-panel/_shared/EditCard";
import { UploadPromptCard } from "./right-panel/_shared/UploadPromptCard";
import { RecommendationsDock } from "./right-panel/_shared/RecommendationsDock";

type RecStatus = Recommendation["status"];

// SIMULATION: Start with 2 Company Facts
const INITIAL_RECS: Recommendation[] = [];

// Store the real initial recommendations for the startup sequence
const STARTUP_RECS: Recommendation[] = [
  {
    id: "sim-fact-1",
    title: "Compile NJ marketplace fact exhibits", 
    intent: "add_evidence",
    category: "facts",
    status: "suggested",
    summary: "Collect gross receipts and transaction data to verify NJ marketplace thresholds.",
    instructions: "Add or review the files to be saved to the current research.",
    context: { section: "Facts", issue: "Economic Nexus", jurisdictions: ["NJ"] },
    aiReasoning: {
      trigger: "Phase 1 depth-first methodology: broad marketplace analysis",
      reasoning: "Following our structured research approach - starting broad with marketplace activity detection, then narrowing to specific NJ thresholds ($100k revenue/200 transactions). This factual foundation is essential before Phase 2 legal research.",
      thoughtId: "startup-thought-1"
    }
  },
  {
    id: "sim-fact-2",
    title: "Gather digital goods transaction records",
    intent: "add_evidence", 
    category: "facts",
    status: "suggested",
    summary: "Document marketplace sales of digital products and services for CY2024.",
    instructions: "Add or review the files to be saved to the current research.",
    suggestedAttachments: [
      { id: "sug-digital-1", name: "Digital Sales Report Q1-Q4 2024.xlsx", kind: "file" },
      { id: "sug-digital-2", name: "Marketplace Transaction Log.csv", kind: "file" },
    ],
    context: { section: "Facts", issue: "Digital Products", jurisdictions: ["NJ"] },
    aiReasoning: {
      trigger: "Phase 1 narrow focus: digital product transaction specifics", 
      reasoning: "Applying depth-first fact-gathering - broad digital goods category established, now narrowing to transaction-level sourcing details. Customer location data is critical for Phase 2 codes & regulations research on taxability rules.",
      thoughtId: "startup-thought-2"
    }
  },
];

const SAMPLE_SOURCE_CONTENT = {
  statute:
    "Section 54:32B-3.6 establishes that a marketplace facilitator is treated as the vendor when it controls payment collection, fulfillment, and listing authority. Economic nexus threshold is $100,000 in gross receipts or 200 separate transactions sourced to New Jersey during the prior or current calendar year. Digital goods delivered electronically remain taxable when the customer location is within the state.",
  guidance:
    "Division of Taxation Technical Bulletin ST-18 confirms that digitally delivered books, music, and subscription media are taxable tangible personal property equivalents. Facilitators must maintain channel-level reports showing which listings are digital-only and document subscriber location to substantiate sourcing.",
  nyOpinion:
    "TSB-A-19(8)S explains that the Department evaluates marketplace agreements to determine who controls the customer experience. Digital marketplace operators must document how they source transactions into each state and provide written disclosures when they remit on behalf of sellers.",
  facts:
    "Workpapers summarize gross receipts by channel, highlight digital-only listings, and reconcile the sales registers to NJ returns for calendar year 2024.",
  prior:
    "Prior advisory memoranda outline field audit expectations and provide template disclosures for marketplace operators remitting on behalf of third-party sellers.",
};

const INITIAL_SOURCES: SourceItem[] = [
  {
    id: "src-nj-statute",
    name: "N.J.S.A. 54:32B-3.6",
    kind: "pdf",
    category: "laws",
    addedAt: "2024-03-15T10:00:00.000Z",
    href: "https://law.justia.com/codes/new-jersey/2024/title-54/",
    missing: false,
    origin: "upload",
    preview: SAMPLE_SOURCE_CONTENT.statute,
  },
  {
    id: "src-nj-guidance",
    name: "NJ Division of Taxation ST-18",
    kind: "pdf",
    category: "laws",
    addedAt: "2024-04-02T10:00:00.000Z",
    href: "https://www.state.nj.us/treasury/taxation/pdf/pubs/sales/st-18.pdf",
    missing: false,
    origin: "upload",
    preview: SAMPLE_SOURCE_CONTENT.guidance,
  },
  {
    id: "src-marketplace-facts",
    name: "Marketplace sales workpaper excerpt",
    kind: "pdf",
    category: "facts",
    addedAt: "2024-04-08T10:00:00.000Z",
    href: "https://example.com/workpapers/marketplace-facts",
    missing: false,
    origin: "upload",
    preview: SAMPLE_SOURCE_CONTENT.facts,
  },
  {
    id: "src-ny-tsb",
    name: "NY TSB-A-19(8)S",
    kind: "pdf",
    category: "laws",
    addedAt: "2024-02-10T10:00:00.000Z",
    href: "https://www.tax.ny.gov/pdf/advisory_opinions/sales/a19_8s.pdf",
    missing: false,
    origin: "upload",
    preview: SAMPLE_SOURCE_CONTENT.nyOpinion,
  },
];

const ISSUE_STATEMENT =
  "The client seeks guidance on whether its marketplace facilitator operations trigger economic nexus obligations in New Jersey following recent regulatory updates.";

const FACTS_SENTENCE =
  "Transaction volume exceeded the [NJ economic nexus thresholds] in CY2024, with a significant share arising from digital goods subject to [Division of Taxation guidance].";

const ANALYSIS_SENTENCE =
  "Comparable rulings, such as NY Advisory Opinion TSB-A-19(8)S, demonstrate regulator focus on digital marketplaces.";

const MOCK_ISSUES: ValidationIssue[] = [
  {
    id: "issue-1",
    title: "Issue framing needs timeframe and product focus",
    type: "missing_detail",
    severity: "med",
    section: "Issue",
    excerpt: ISSUE_STATEMENT,
    findPattern: ISSUE_STATEMENT,
    fixOptions: [
      "Clarify the period the analysis covers (e.g., CY2024).",
      "Call out that the question centers on digitally delivered products.",
    ],
    autoFix:
      "The client seeks guidance on whether its marketplace facilitator operations during CY2024 trigger New Jersey economic nexus obligations, particularly for digitally delivered products sold through its platform.",
    sourceId: "src-nj-statute",
    sourceExcerpt: "Economic nexus threshold is $100,000 in gross receipts or 200 separate transactions sourced to New Jersey during the prior or current calendar year.",
  },
  {
    id: "issue-2",
    title: "Facts rely on placeholder citation text",
    type: "placeholder_language",
    severity: "med",
    section: "Facts",
    excerpt: FACTS_SENTENCE,
    findPattern: FACTS_SENTENCE,
    fixOptions: [
      "Replace bracketed link text with the actual threshold amount.",
      "Tie the Division of Taxation reference to the relevant digital product guidance.",
    ],
    autoFix:
      "Transaction volume exceeded New Jersey's $100,000 economic nexus threshold in CY2024, and a significant share arose from digital goods covered by Division of Taxation guidance on electronically delivered products.",
    sourceId: "src-nj-guidance",
    sourceExcerpt: "Digitally delivered books, music, and subscription media are taxable tangible personal property equivalents.",
  },
  {
    id: "issue-3",
    title: "Analysis needs New Jersey-specific tie-back",
    type: "unsupported_comparison",
    severity: "high",
    section: "Analysis",
    excerpt: ANALYSIS_SENTENCE,
    findPattern: ANALYSIS_SENTENCE,
    fixOptions: [
      "Explain why the New York advisory opinion is analogous to the New Jersey rules.",
      "Note any jurisdictional differences so the comparison does not overstate its authority.",
    ],
    autoFix:
      "Comparable rulings, such as NY Advisory Opinion TSB-A-19(8)S, highlight regulator focus on digital marketplaces and should be reconciled with New Jersey's facilitator guidance and any jurisdictional limits.",
    sourceId: "src-ny-tsb",
    sourceExcerpt:
      "TSB-A-19(8)S explains that the Department evaluates marketplace agreements to determine who controls the customer experience.",
  },
];

const SAMPLE_EDIT_TEXT = (spec: string) =>
  `**Marketplace Facilitator Nexus (New Jersey).** Under N.J.S.A. 54:32B-3 and implementing guidance, a marketplace facilitator that exceeds the statutory economic threshold is treated as the vendor responsible for collecting and remitting sales tax on facilitated sales. The client's platform meets facilitation criteria (payment processing, fulfillment coordination, and listing control) and exceeded the threshold in CY2024. Accordingly, the safer position is to register and collect prospectively while filing a protective return for prior quarters. See also NJ Division of Taxation bulletins addressing digital goods and facilitator liability. (Drafted per: "${spec}")`;

type SimpleEditorProps = {
  value: string;
  onChange: (next: string) => void;
};

type SimpleEditorComponent = React.ForwardRefExoticComponent<
  SimpleEditorProps & React.RefAttributes<EditorHandle>
>;

const MemoSimpleEditor = dynamic(() => import("./editor/SimpleEditor"), {
  ssr: false,
  loading: () => <div className="flex-1 border-r px-4 py-3 text-sm text-muted-foreground">Loading editor…</div>,
}) as SimpleEditorComponent;

const INITIAL_DOC = [
  "<h1>Issue</h1>",
  "<p>The client seeks guidance on whether its marketplace facilitator operations trigger economic nexus obligations in New Jersey following recent regulatory updates.</p>",
  "<h1>Facts</h1>",
  '<p>The platform processes payments, manages fulfillment, and curates listings for third-party sellers. Transaction volume exceeded the <a href="https://www.nj.gov/treasury/taxation/sales-nexus.shtml">[NJ economic nexus thresholds]</a> in CY2024, with a significant share arising from digital goods subject to <a href="https://www.state.nj.us/treasury/taxation/digital-products.shtml">[Division of Taxation guidance]</a>.</p>',
  "<h1>Law</h1>",
  '<p>New Jersey imposes sales tax collection duties on facilitators meeting statutory criteria per <a href="https://law.justia.com/codes/new-jersey/2024/title-54/">[N.J.S.A. 54:32B-3]</a>. Administrative releases, including <a href="https://www.state.nj.us/treasury/taxation/pdf/pubs/sales/st-18.pdf">[ST-18]</a>, clarify that digital product sales fall within the taxable base when delivered electronically to in-state customers.</p>',
  "<h1>Analysis</h1>",
  '<p>The client satisfies the facilitator definition and has crossed the monetary threshold, suggesting nexus is established. Comparable rulings, such as <a href="https://www.tax.ny.gov/pdf/advisory_opinions/sales/a19_8s.pdf">NY Advisory Opinion TSB-A-19(8)S</a>, demonstrate regulator focus on digital marketplaces. Consequently, registration and forward-looking compliance appear prudent while documenting legacy exposure.</p>',
].join("");

function extToKind(filename: string): SourceItem["kind"] {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "rtf"].includes(ext)) return "doc";
  return "other";
}

const JURISDICTION_OPTIONS = ["CA", "FL", "NJ", "NY", "TX", "WA"];
const CATEGORY_OPTIONS = ["Software", "Manufacturing", "Professional Services", "Retail", "Healthcare"];
const CLIENT_OPTIONS = [{ id: "client-1", name: "Acme Retail" }];

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraphsFrom(input: string, fallback: string) {
  const base = input.trim() || fallback;
  return base
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function buildWizardDocPreview({
  fileName,
  issue,
  jurisdictions,
  categories,
  client,
}: {
  fileName: string;
  issue: string;
  jurisdictions: string[];
  categories: string[];
  client: string | null;
}) {
  const safeClient = escapeHtml(client ?? "Client");
  const issueHtml = paragraphsFrom(issue, "Issue narrative to be drafted.");
  const jurisdictionText = jurisdictions.length ? jurisdictions.join(", ") : "Confirm applicable jurisdictions.";
  const focusText = categories.length ? categories.join(", ") : "Add focus areas as you draft.";

  const factsHtml = [
    `<p><strong>${safeClient}</strong> provided <em>${escapeHtml(fileName)}</em> as the starting brief.</p>`,
    '<p>Compare marketplace operations against <a href="https://www.nj.gov/treasury/taxation/sales-nexus.shtml">NJ economic nexus criteria</a> and the <a href="https://www.state.nj.us/treasury/taxation/digital-products.shtml">digital product guidance</a>.</p>',
  ].join("");

  const lawHtml = `<p>Verify statutory triggers for ${escapeHtml(jurisdictionText)} via <a href="https://law.justia.com/codes/new-jersey/2024/title-54/">N.J.S.A. 54:32B-3</a> and related marketplace bulletins.</p>`;

  const analysisHtml = [
    `<p>Outline obligations for ${safeClient} with references to <a href="https://www.tax.ny.gov/pdf/advisory_opinions/sales/a19_8s.pdf">TSB-A-19(8)S</a> and similar rulings.</p>`,
    `<p>Focus areas: ${escapeHtml(focusText)}.</p>`,
  ].join("");

  return [
    "<h1>Issue</h1>",
    issueHtml,
    "<h1>Facts</h1>",
    factsHtml,
    "<h1>Law</h1>",
    lawHtml,
    "<h1>Analysis</h1>",
    analysisHtml,
  ].join("");
}

const CLEAN_FACTS_SENTENCE = FACTS_SENTENCE.replace(/\[(.*?)\]/g, "$1");
const CLEAN_ANALYSIS_SENTENCE = ANALYSIS_SENTENCE.replace(/\[(.*?)\]/g, "$1");

const INITIAL_EMAIL_HTML = paragraphsFrom(
  `Hi team,

${CLEAN_FACTS_SENTENCE}

Thanks,
AI Sidekick`,
  "Follow-up email draft."
);

const INITIAL_EXPLAINER_HTML = paragraphsFrom(
  SAMPLE_SOURCE_CONTENT.guidance,
  SAMPLE_SOURCE_CONTENT.guidance
);

const INITIAL_DRAFT_HTML = [
  "<h1>Work in Progress Notes</h1>",
  paragraphsFrom(
    [
      "Outstanding checkpoints before finalizing the memo:",
      "- Reconcile NJ nexus calculations with the most recent sales data.",
      "- Summarize Division of Taxation guidance on digital facilitators.",
      `- Tie analysis back to jurisdictional focus: ${CLEAN_ANALYSIS_SENTENCE}.`,
    ].join("\n"),
    "Capture outstanding checkpoints before finalizing the memo."
  ),
].join("");

const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc-memo-main",
    name: "Advisory Memorandum",
    kind: "memo",
    content: INITIAL_DOC,
    createdAt: "2024-04-10T10:00:00.000Z",
    updatedAt: "2024-04-10T10:00:00.000Z",
  },
];

const EMPTY_DOC_HTML = "<p>Start drafting here...</p>";

const DEFAULT_MATRIX: MatrixDocument = {
  jurisdictions: ["NJ", "NY", "CA"],
  rows: [
    {
      question: "Economic nexus threshold satisfied?",
      cells: [
        { value: "Yes. $100k or 200 transactions (CY2024). Cite N.J.S.A. 54:32B-3.6." },
        { value: "Yes. $500k receipts or 100 transactions. Cite NY Tax Law § 1101(b)(8)(iv)." },
        { value: "Likely. $500k receipts. Confirm CA Rev. & Tax. Code § 6203." },
      ],
    },
    {
      question: "Marketplace facilitator registration required?",
      cells: [
        { value: "Yes — registration mandated post-threshold. Reference ST-18 guidance." },
        { value: "Yes — required once obligated to collect tax. Cite TSB-A-19(8)S." },
        { value: "Yes — CDTFA requires registration once threshold met." },
      ],
    },
    {
      question: "Document retention / reporting notes",
      cells: [
        { value: "Maintain channel-level transaction reports. Cite NJ TAC 18:24-2.5." },
        { value: "Retain marketplace agreements & remittance proofs. Cite TSB-A-19(8)S." },
        { value: "Track marketplace level invoices for CDTFA audit support." },
      ],
    },
  ],
};

const cloneMatrix = (matrix: MatrixDocument): MatrixDocument =>
  JSON.parse(JSON.stringify(matrix)) as MatrixDocument;

type TemplateKey = "memo" | "email" | "empty" | "matrix";

type TemplateDefinition = {
  kind: DocumentKind;
  name: string;
  content?: string;
  matrix?: MatrixDocument;
};

const DOCUMENT_TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
  memo: { kind: "memo", name: "Memo Draft", content: INITIAL_DOC },
  email: { kind: "email", name: "Email Draft", content: INITIAL_EMAIL_HTML },
  empty: { kind: "draft", name: "Blank Document", content: EMPTY_DOC_HTML },
  matrix: { kind: "matrix", name: "Matrix", matrix: DEFAULT_MATRIX },
};

const DOCUMENT_TEMPLATE_OPTIONS: Array<{
  value: TemplateKey;
  title: string;
  description: string;
}> = [
  {
    value: "memo",
    title: "Memo",
    description: "Full advisory memo outline with issue, facts, law, and analysis sections.",
  },
  {
    value: "email",
    title: "Email",
    description: "Client-facing summary email template to share key findings.",
  },
  {
    value: "empty",
    title: "Blank",
    description: "Start from a clean slate and structure the document yourself.",
  },
  {
    value: "matrix",
    title: "Matrix",
    description: "Tabular matrix for multi-jurisdiction comparisons with per-state answers and citations.",
  },
];

const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  memo: "Memo",
  email: "Email",
  draft: "Draft",
  explanation: "Explainer",
  matrix: "Matrix",
};

type ParsedLink = {
  href: string;
  label?: string;
  type: "source" | "external";
  sourceId?: string;
};

function normalizeHref(href: string) {
  return href.trim().replace(/\/+$/, "").toLowerCase();
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function deriveNameFromHref(href: string) {
  try {
    const url = new URL(href);
    const path = url.pathname && url.pathname !== "/" ? url.pathname : "";
    return `${url.hostname}${path}`;
  } catch {
    return href;
  }
}

function parseLinksFromDocument(text: string): Map<string, ParsedLink> {
  if (typeof window === "undefined") {
    return new Map();
  }
  const links = new Map<string, ParsedLink>();

  const addLink = (rawHref: string, label?: string) => {
    if (!rawHref) return;
    const cleaned = rawHref.trim();
    if (!cleaned) return;
    if (cleaned.startsWith("#")) return;
    const lower = cleaned.toLowerCase();
    const type: ParsedLink["type"] = lower.startsWith("source://") ? "source" : "external";
    const key = type === "source" ? lower : normalizeHref(cleaned);
    if (links.has(key)) return;
    const entry: ParsedLink = { href: cleaned, label, type };
    if (type === "source") {
      entry.sourceId = cleaned.replace(/^source:\/\//i, "");
    }
    links.set(key, entry);
  };

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  doc.querySelectorAll("a[href]").forEach((anchor) => {
    addLink(anchor.getAttribute("href") ?? "", anchor.textContent ?? undefined);
  });

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const content = node.textContent ?? "";
    let match: RegExpExecArray | null;
    const regex = /(https?:\/\/[^\s)]+)/g;
    while ((match = regex.exec(content)) !== null) {
      addLink(match[1]);
    }
  }

  return links;
}

function defaultPreviewForSource(name: string, category: SourceCategory) {
  if (category === "laws") return SAMPLE_SOURCE_CONTENT.statute;
  if (category === "explanations") return SAMPLE_SOURCE_CONTENT.guidance;
  if (category === "prior") return SAMPLE_SOURCE_CONTENT.prior;
  return `${name} - ${SAMPLE_SOURCE_CONTENT.facts}`;
}

type SectionAnchors = {
  issue?: string | null;
  facts?: string | null;
  analysis?: string | null;
};

function deriveSectionAnchors(html: string): SectionAnchors {
  if (typeof window === "undefined") return {};
  try {
    const parser = new window.DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const findParagraph = (heading: string) => {
      const headings = Array.from(dom.querySelectorAll("h1, h2, h3"));
      const target = headings.find((node) => node.textContent?.trim().toLowerCase() === heading.toLowerCase());
      if (!target) return null;
      let sibling = target.nextElementSibling;
      while (sibling) {
        if (sibling.tagName?.toLowerCase() === "p") {
          const text = sibling.textContent?.trim();
          if (text) return text;
        }
        sibling = sibling.nextElementSibling;
      }
      return null;
    };
    return {
      issue: findParagraph("issue"),
      facts: findParagraph("facts"),
      analysis: findParagraph("analysis"),
    };
  } catch {
    return {};
  }
}

export function SidekickShell() {
  const [recs, setRecs] = React.useState<Recommendation[]>(INITIAL_RECS);
  const [messages, setMessages] = React.useState<React.ReactNode[]>([]);
  const [input, setInput] = React.useState("");
  const [awaitingDraftSpec, setAwaitingDraftSpec] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"chat" | "actions" | "validate" | "workflow">("chat");
  const [projectName] = React.useState("Acme Retail - AI Tax Advisory");
  const [documents, setDocuments] = React.useState<ProjectDocument[]>(INITIAL_DOCUMENTS);
  const [activeDocumentId, setActiveDocumentId] = React.useState<string>(INITIAL_DOCUMENTS[0]?.id ?? "");
  const [sources, setSources] = React.useState<SourceItem[]>(INITIAL_SOURCES);
  const [selectedSourceId, setSelectedSourceId] = React.useState<string | null>(null);
  const [sourceHighlight, setSourceHighlight] = React.useState<string | null>(null);
  const [workspaceSourceId, setWorkspaceSourceId] = React.useState<string | null>(null);
  const [libQuery, setLibQuery] = React.useState("");
  const [libCategory, setLibCategory] = React.useState<"all" | SourceCategory>("all");
  const [showLibrary, setShowLibrary] = React.useState(true);
  const [showRightPanel, setShowRightPanel] = React.useState(true);
  const [showAttachmentPicker, setShowAttachmentPicker] = React.useState(false);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = React.useState<string[]>([]);
  const [validationScore, setValidationScore] = React.useState(82);
  const [validationIssues, setValidationIssues] = React.useState<ValidationIssue[]>(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = React.useState<ValidationIssue | null>(null);
  const [showOnboarding, setShowOnboarding] = React.useState(true);
  const [wizardStep, setWizardStep] = React.useState<0 | 1>(0);
  const [wizardIssue, setWizardIssue] = React.useState("");
  const [wizardJurisdictions, setWizardJurisdictions] = React.useState<string[]>([]);
  const [wizardCategories, setWizardCategories] = React.useState<string[]>([]);
  const [wizardClient, setWizardClient] = React.useState<string | null>(CLIENT_OPTIONS[0]?.name ?? null);
  const [wizardDocName, setWizardDocName] = React.useState<string | null>(null);
  const [wizardDocPreview, setWizardDocPreview] = React.useState<string | null>(null);
  const [wizardLibraryCategory, setWizardLibraryCategory] = React.useState<SourceCategory>("facts");
  const [wizardLibraryUploads, setWizardLibraryUploads] = React.useState<
    { name: string; category: SourceCategory }[]
  >([]);
  const [showDocModal, setShowDocModal] = React.useState(false);
  const [docModalMode, setDocModalMode] = React.useState<"template" | "upload">("template");
  const [docModalTemplate, setDocModalTemplate] = React.useState<TemplateKey>("memo");
  const [docModalName, setDocModalName] = React.useState("Untitled Document");
  const [docModalNameTouched, setDocModalNameTouched] = React.useState(false);
  const [docModalKind, setDocModalKind] = React.useState<DocumentKind>("memo");
  const [docModalFile, setDocModalFile] = React.useState<File | null>(null);
  const [docModalFileContent, setDocModalFileContent] = React.useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = React.useState(false);
  const [sourceModalCategory, setSourceModalCategory] = React.useState<SourceCategory>("facts");
  const [sourceModalFile, setSourceModalFile] = React.useState<File | null>(null);
  const [sourceModalPreview, setSourceModalPreview] = React.useState<string | null>(null);

  // 🚀 STARTUP SEQUENCE - First-time actions tab initialization
  const [hasStartedUp, setHasStartedUp] = React.useState(false);
  const [isStartingUp, setIsStartingUp] = React.useState(false);
  const [startupPhase, setStartupPhase] = React.useState(0);

  // 🧠 AI REASONING SYSTEM - Responds to actual user progress
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [transitionThoughts, setTransitionThoughts] = React.useState<string[]>([]);
  const [currentThought, setCurrentThought] = React.useState(0);
  const [lastStageState, setLastStageState] = React.useState<string>('starting');
  
  // 🎯 AI STRATEGIC & TACTICAL THINKING
  const [recentThoughts, setRecentThoughts] = React.useState<AIThought[]>([
    {
      id: "startup-thought-1",
      timestamp: new Date(),
      phase: "facts",
      trigger: "Initiating Phase 1 — Company Facts research",
      reasoning: "Starting broad with digital marketplace analysis, then narrowing to specific NJ nexus thresholds and transaction patterns. Need to establish factual foundation before legal research.",
      actionCreated: "Compile NJ marketplace fact exhibits"
    },
    {
      id: "startup-thought-2", 
      timestamp: new Date(),
      phase: "facts",
      trigger: "Digital products require detailed fact-gathering",
      reasoning: "Phase 1 depth-first approach: broad digital goods category, then narrow to specific sourcing and customer location facts needed for Phase 2 legal research.",
      actionCreated: "Gather digital goods transaction records"
    }
  ]);
  const [currentPhase, setCurrentPhase] = React.useState<AIPhase | undefined>({
    id: "facts",
    name: "Phase 1 — Company Facts",
    number: 1,
    description: "Gathering broad facts, then narrowing to specifics",
    reasoning: "I'm beginning with Phase 1 of our research methodology. Starting broad with industry and business model, then narrowing to specifics like product types, nexus, billing structure, and customer context to establish the factual foundation.",
    status: "active"
  });

  // Handle phase change from dropdown
  const handlePhaseChange = React.useCallback((phaseId: AIPhase['id']) => {
    const phaseMap: Record<AIPhase['id'], AIPhase> = {
      facts: {
        id: "facts",
        name: "Phase 1 — Company Facts",
        number: 1,
        description: "Gathering broad facts, then narrowing to specifics",
        reasoning: "I'm in Phase 1 of our research methodology. Starting broad with industry and business model, then narrowing to specifics like product types, nexus, billing structure, and customer context.",
        status: "active"
      },
      laws: {
        id: "laws", 
        name: "Phase 2 — Codes & Regulations",
        number: 2,
        description: "Broad-to-narrow legal research",
        reasoning: "Now conducting Phase 2 - exhaustive legal research using broad-to-narrow approach. Starting with general statutes, then narrowing to context-specific applications, definitions, and exemptions.",
        status: "active"
      },
      analysis: {
        id: "analysis",
        name: "Phase 3 — Analysis", 
        number: 3,
        description: "Synthesize law with company facts",
        reasoning: "In Phase 3 - synthesizing the established law with your specific company facts to provide comprehensive guidance on tax implications and recommendations.",
        status: "active"
      }
    };
    
    setCurrentPhase(phaseMap[phaseId]);
    
    // Add a thought about the phase change
    const newThought: AIThought = {
      id: `phase-change-${Date.now()}`,
      timestamp: new Date(),
      phase: phaseId,
      trigger: `User manually switched to ${phaseMap[phaseId].name}`,
      reasoning: `Adapting research focus to ${phaseMap[phaseId].description.toLowerCase()}. This allows targeted methodology application based on current research needs.`,
      context: { userAction: 'phase_change' }
    };
    
    setRecentThoughts(prev => [newThought, ...prev.slice(0, 2)]);
  }, []);

  const getTransitionThoughts = React.useCallback((fromStage: string, toStage: string): string[] => {
    const transitions: Record<string, string[]> = {
      "starting->facts_active": [
        "I see the user is starting to work on company facts...",
        "This is the perfect foundation for our advisory memo...",
        "Let me focus on helping them gather key operational details..."
      ],
      "facts_active->facts_completed": [
        "The user just completed the company facts gathering...",
        "I now have a solid understanding of their operational situation...",
        "Time to move to legal research phase..."
      ],
      "facts_completed->laws_active": [
        "Facts are complete, unlocking legal research...",
        "I need to help them find the applicable statutes and regulations...",
        "Legal framework research is now available..."
      ],
      "laws_active->laws_completed": [
        "Legal research actions completed successfully...",
        "The user is making good progress on statutory analysis...",
        "Soon we can move to synthesis phase..."
      ],
      "laws_completed->analysis_available": [
        "Great! Both facts and laws are well-researched...",
        "Now I have everything needed for comprehensive analysis...",
        "Time to help synthesize all this research..."
      ],
      "analysis_available->analysis_active": [
        "Analysis actions are ready for the user...",
        "This will pull together facts, law, and conclusions...",
        "Almost ready for final memo recommendations..."
      ],
      "dynamic_facts_added": [
        "Wait, I'm detecting some gaps in the factual record...",
        "Let me add one more critical fact-gathering action...",
        "This will strengthen our legal analysis..."
      ]
    };
    
    return transitions[`${fromStage}->${toStage}`] || transitions["dynamic_facts_added"] || [
      "Processing the user's recent progress...",
      "Analyzing what needs to happen next...",
      "Updating my strategy accordingly..."
    ];
  }, []);

  // Detect current stage based on actual recommendation state
  const getCurrentStageState = React.useCallback(() => {
    const factsRecs = recs.filter(r => r.category === 'facts');
    const lawsRecs = recs.filter(r => r.category === 'laws');
    const analysisRecs = recs.filter(r => r.category === 'analysis');
    
    const factsCompleted = factsRecs.length > 0 && factsRecs.every(r => r.status === 'closed');
    const lawsCompleted = lawsRecs.length > 0 && lawsRecs.every(r => r.status === 'closed');
    const analysisStarted = analysisRecs.length > 0;
    
    if (analysisRecs.some(r => r.status === 'closed')) return 'analysis_completed';
    if (analysisRecs.some(r => r.status !== 'closed')) return 'analysis_active';
    if (analysisStarted) return 'analysis_available';
    if (lawsCompleted) return 'laws_completed';
    if (lawsRecs.some(r => r.status !== 'closed')) return 'laws_active';
    if (lawsRecs.length > 0) return 'laws_available';
    if (factsCompleted) return 'facts_completed';
    if (factsRecs.some(r => r.status !== 'closed')) return 'facts_active';
    if (factsRecs.length > 0) return 'facts_available';
    return 'starting';
  }, [recs]);

  // 🚀 STARTUP SEQUENCE - Trigger when actions tab is first visited
  React.useEffect(() => {
    if (activeTab === 'actions' && !hasStartedUp && !isStartingUp && recs.length === 0) {
      setIsStartingUp(true);
      setStartupPhase(0);
      
      // Phase 1: Initial analysis
      setTransitionThoughts([
        "10X AI analyzing your workspace...",
        "Detecting tax advisory opportunity...", 
        "Reviewing Acme Retail company profile...",
        "Structuring strategic approach..."
      ]);
      setIsTransitioning(true);
      setCurrentThought(0);
      
      // Animate through startup thoughts
      let thoughtIndex = 0;
      const startupInterval = setInterval(() => {
        thoughtIndex++;
        if (thoughtIndex >= 4) {
          clearInterval(startupInterval);
          
          // Phase 2: Add initial actions after analysis
          setTimeout(() => {
            setIsTransitioning(false);
            setRecs(STARTUP_RECS);
            setIsStartingUp(false);
            setHasStartedUp(true);
          }, 800);
        } else {
          setCurrentThought(thoughtIndex);
        }
      }, 1500); // Slower startup thinking
    }
  }, [activeTab, hasStartedUp, isStartingUp, recs.length]);

  // Trigger transition animation when stage changes
  React.useEffect(() => {
    const currentStage = getCurrentStageState();
    
    if (currentStage !== lastStageState && lastStageState !== 'starting') {
      // Stage changed - trigger thinking animation
      const thoughts = getTransitionThoughts(lastStageState, currentStage);
      setTransitionThoughts(thoughts);
      setIsTransitioning(true);
      setCurrentThought(0);
      
      // Animate through thoughts
      let thoughtIndex = 0;
      const thoughtInterval = setInterval(() => {
        thoughtIndex++;
        if (thoughtIndex >= thoughts.length) {
          clearInterval(thoughtInterval);
          // End transition
          setTimeout(() => {
            setIsTransitioning(false);
            
            // Add new actions based on stage changes
            if (currentStage === 'facts_completed' && lastStageState === 'facts_active') {
              // Add law actions when facts are completed
              setRecs(prev => [...prev,
                {
                  id: "auto-law-1",
                  title: "Research NJ economic nexus statute",
                  intent: "add_evidence",
                  category: "laws",
                  status: "suggested",
                  summary: "Analyze N.J.S.A. 54:32B-3.6 marketplace facilitator provisions.",
                  instructions: "Add or review the files to be saved to the current research.",
                  attachments: [
                    { id: "src-nj-statute", name: "N.J.S.A. 54:32B-3.6", kind: "source" },
                  ],
                  context: { section: "Laws", issue: "Economic Nexus", jurisdictions: ["NJ"] },
                },
                {
                  id: "auto-law-2", 
                  title: "Review digital goods tax guidance",
                  intent: "add_evidence",
                  category: "laws",
                  status: "suggested",
                  summary: "Document NJ Division of Taxation guidance on digital marketplace sales.",
                  instructions: "Add or review the files to be saved to the current research.",
                  attachments: [
                    { id: "src-nj-guidance", name: "NJ Division of Taxation ST-18", kind: "source" },
                  ],
                  context: { section: "Laws", issue: "Digital Goods", jurisdictions: ["NJ"] },
                }
              ]);
            } else if (currentStage === 'laws_completed' && lastStageState === 'laws_active') {
              // Add analysis actions when laws are completed
              setRecs(prev => [...prev,
                {
                  id: "auto-analysis-1",
                  title: "Draft nexus conclusion memo",
                  intent: "draft",
                  category: "analysis", 
                  status: "ready_to_draft",
                  summary: "Synthesize facts and law into final nexus determination.",
                  instructions: "Generate analysis based on collected evidence.",
                  attachments: [
                    { id: "src-facts-summary", name: "Transaction Analysis Summary", kind: "source" },
                    { id: "src-law-summary", name: "NJ Statute Analysis", kind: "source" },
                  ],
                  context: { section: "Analysis", issue: "Final Determination", jurisdictions: ["NJ"] },
                }
              ]);
            }
          }, 500);
        } else {
          setCurrentThought(thoughtIndex);
        }
      }, 1200); // 1.2 seconds between thoughts
    }
    
    setLastStageState(currentStage);
  }, [recs, lastStageState, getCurrentStageState, getTransitionThoughts]);

  // Add additional fact-gathering action after laws are completed (dynamic iteration demo)
  React.useEffect(() => {
    const lawsRecs = recs.filter(r => r.category === 'laws');
    const lawsCompleted = lawsRecs.length > 0 && lawsRecs.every(r => r.status === 'closed');
    const hasExtraFact = recs.some(r => r.id === 'auto-fact-extra');
    
    if (lawsCompleted && !hasExtraFact) {
      // After a short delay, add an additional fact-gathering action
      const timer = setTimeout(() => {
        setTransitionThoughts(["Wait, I'm detecting some gaps in the factual record...", "Let me add one more critical fact-gathering action...", "This will strengthen our legal analysis..."]);
        setIsTransitioning(true);
        setCurrentThought(0);
        
        let thoughtIndex = 0;
        const thoughtInterval = setInterval(() => {
          thoughtIndex++;
          if (thoughtIndex >= 3) {
            clearInterval(thoughtInterval);
            setTimeout(() => {
              setIsTransitioning(false);
              setRecs(prev => [...prev,
                {
                  id: "auto-fact-extra",
                  title: "Verify 2024 transaction thresholds", 
                  intent: "add_evidence",
                  category: "facts",
                  status: "suggested",
                  summary: "Cross-reference Q4 data to confirm exceeding 200 transaction threshold.",
                  instructions: "Add or review the files to be saved to the current research.",
                  context: { section: "Facts", issue: "Threshold Analysis", jurisdictions: ["NJ"] },
                }
              ]);
            }, 500);
          } else {
            setCurrentThought(thoughtIndex);
          }
        }, 1200);
      }, 3000); // 3 second delay after laws completion
      
      return () => clearTimeout(timer);
    }
  }, [recs]);

  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const editorRef = React.useRef<EditorHandle | null>(null);
  const pendingSourcesRef = React.useRef<SourceItem[]>([]);
  const actionStatusMemory = React.useRef<Map<string, Recommendation["status"]>>(new Map());
  const activeDocument = React.useMemo(() => {
    if (documents.length === 0) return null;
    const match = documents.find((doc) => doc.id === activeDocumentId);
    return match ?? documents[0];
  }, [activeDocumentId, documents]);
  const activeDocumentContent =
    activeDocument && activeDocument.kind === "matrix" ? "" : activeDocument?.content ?? "";
  const activeMatrix = React.useMemo(() => {
    if (activeDocument?.kind !== "matrix") return null;
    return activeDocument.matrix ?? DEFAULT_MATRIX;
  }, [activeDocument]);
  const workspaceSource = React.useMemo(
    () => (workspaceSourceId ? sources.find((src) => src.id === workspaceSourceId) ?? null : null),
    [sources, workspaceSourceId]
  );
  const workspaceSourcePreview = React.useMemo(() => {
    if (!workspaceSource) return [];
    const preview = workspaceSource.preview ?? "No preview available for this source.";
    return preview
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [workspaceSource]);
  const selectedSource = React.useMemo(
    () => sources.find((s) => s.id === selectedSourceId) ?? null,
    [sources, selectedSourceId]
  );
  const projectBreadcrumb = React.useMemo(() => {
    if (workspaceSource) return `${projectName} / Source / ${workspaceSource.name}`;
    if (!activeDocument) return projectName;
    return `${projectName} / ${activeDocument.name}`;
  }, [activeDocument, projectName, workspaceSource]);
  const editorFlexClass = React.useMemo(() => {
    if (showLibrary && showRightPanel) return "flex-[3]";
    if (!showLibrary && !showRightPanel) return "flex-1";
    return "flex-[4]";
  }, [showLibrary, showRightPanel]);

  const groupedSources = React.useMemo(() => {
    const base: Record<SourceCategory, SourceItem[]> = {
      facts: [],
      laws: [],
      explanations: [],
      prior: [],
    };
    sources.forEach((src) => {
      base[src.category] = base[src.category] ?? [];
      base[src.category].push(src);
    });
    return base;
  }, [sources]);
  const folderOrder: SourceCategory[] = ["facts", "laws", "explanations", "prior"];
  const categoryLabels: Record<SourceCategory, string> = {
    facts: "Facts",
    laws: "Laws & Authority",
    explanations: "Explanations",
    prior: "Prior Work",
  };

  const selectedAttachments = React.useMemo(
    () => sources.filter((src) => selectedAttachmentIds.includes(src.id)),
    [sources, selectedAttachmentIds]
  );
  const attachmentsActive = selectedAttachmentIds.length > 0;
  const toggleAttachmentSelection = React.useCallback((id: string) => {
    setSelectedAttachmentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const closeAttachmentPicker = React.useCallback(() => setShowAttachmentPicker(false), []);

  useAutoScroll(messages.length, activeTab === "chat", chatBottomRef);

  React.useEffect(() => {
    setSelectedAttachmentIds((prev) => prev.filter((id) => sources.some((src) => src.id === id)));
  }, [sources]);

  const postAssistant = React.useCallback(
    (text: string) => setMessages((prev) => [...prev, <Bubble role="ai" key={`ai-${prev.length}`}>{text}</Bubble>]),
    []
  );

  React.useEffect(() => {
    if (documents.length === 0) {
      if (activeDocumentId) {
        setActiveDocumentId("");
      }
      return;
    }
    const exists = documents.some((doc) => doc.id === activeDocumentId);
    if (!exists) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents]);

  const setActiveDocumentContent = React.useCallback(
    (next: string) => {
      if (!activeDocument || activeDocument.kind === "matrix") return;
      const docId = activeDocument.id;
      const timestamp = new Date().toISOString();
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, content: next, updatedAt: timestamp } : doc))
      );
    },
    [activeDocument]
  );

  const queueSourcesForDraft = React.useCallback((items: SourceItem[]) => {
    pendingSourcesRef.current = items;
  }, []);

  const flushQueuedSourcesIntoEditor = React.useCallback(() => {
    const queued = pendingSourcesRef.current;
    if (!editorRef.current || queued.length === 0) return;
    queued.forEach((src) => {
      const href = src.href ?? `source://${src.id}`;
      editorRef.current?.insertLink(src.name.replace(/\.[^.]+$/, ""), href);
    });
    pendingSourcesRef.current = [];
  }, []);

  const openSourcePreview = React.useCallback((id: string | null, highlight?: string | null) => {
    setSelectedSourceId(id);
    setSourceHighlight(highlight ?? null);
    if (id) {
      setWorkspaceSourceId(null);
    }
  }, []);

  const handleSelectSource = React.useCallback(
    (src: SourceItem) => {
      openSourcePreview(src.id);
    },
    [openSourcePreview]
  );

  const handleSelectFileSource = React.useCallback(
    (sourceId: string, sourceName: string) => {
      // Create a SourceItem-like object for the file
      const sourceItem: SourceItem = {
        id: sourceId,
        name: sourceName,
        kind: "other" as const,
        category: "facts" as const,
        addedAt: new Date().toISOString(),
      };
      handleSelectSource(sourceItem);
    },
    [handleSelectSource]
  );

  const handleSelectDocument = React.useCallback(
    (doc: ProjectDocument) => {
      setActiveDocumentId(doc.id);
      openSourcePreview(null);
      setWorkspaceSourceId(null);
    },
    [openSourcePreview]
  );

  const openDocumentModal = React.useCallback(() => {
    const suffix = documents.length + 1;
    setDocModalMode("template");
    setDocModalTemplate("memo");
    setDocModalName(`${DOCUMENT_TEMPLATES.memo.name} ${suffix}`);
    setDocModalKind(DOCUMENT_TEMPLATES.memo.kind);
    setDocModalFile(null);
    setDocModalFileContent(null);
    setDocModalNameTouched(false);
    setShowDocModal(true);
  }, [documents.length]);

  const closeDocumentModal = React.useCallback(() => {
    setShowDocModal(false);
    setDocModalFile(null);
    setDocModalFileContent(null);
    setDocModalNameTouched(false);
  }, []);

  const openSourceModal = React.useCallback(() => {
    setSourceModalCategory("facts");
    setSourceModalFile(null);
    setSourceModalPreview(null);
    setShowSourceModal(true);
  }, []);

  const closeSourceModal = React.useCallback(() => {
    setShowSourceModal(false);
    setSourceModalFile(null);
    setSourceModalPreview(null);
  }, []);

  const openSourceInWorkspace = React.useCallback(
    (src: SourceItem) => {
      setWorkspaceSourceId(src.id);
      setSelectedSourceId(null);
      setSourceHighlight(null);
    },
    []
  );

  const closeWorkspaceSource = React.useCallback(() => {
    setWorkspaceSourceId(null);
  }, []);

  const updateMatrix = React.useCallback(
    (updater: (matrix: MatrixDocument) => MatrixDocument) => {
      if (!activeDocumentId) return;
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== activeDocumentId || doc.kind !== "matrix") return doc;
          const base = doc.matrix ?? DEFAULT_MATRIX;
          const draft = cloneMatrix(base);
          const nextMatrix = updater(draft);
          return {
            ...doc,
            matrix: nextMatrix,
            content: doc.content ?? "",
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [activeDocumentId]
  );

  const handleMatrixQuestionChange = React.useCallback(
    (rowIndex: number, value: string) => {
      updateMatrix((matrix) => {
        if (!matrix.rows[rowIndex]) return matrix;
        matrix.rows[rowIndex] = { ...matrix.rows[rowIndex], question: value };
        return matrix;
      });
    },
    [updateMatrix]
  );

  const handleMatrixCellChange = React.useCallback(
    (rowIndex: number, columnIndex: number, value: string) => {
      updateMatrix((matrix) => {
        if (!matrix.rows[rowIndex]) return matrix;
        const targetRow = matrix.rows[rowIndex];
        const cells = targetRow.cells.slice();
        cells[columnIndex] = { ...cells[columnIndex], value };
        matrix.rows[rowIndex] = { ...targetRow, cells };
        return matrix;
      });
    },
    [updateMatrix]
  );

  const handleMatrixJurisdictionChange = React.useCallback(
    (columnIndex: number, value: string) => {
      updateMatrix((matrix) => {
        if (!matrix.jurisdictions[columnIndex]) return matrix;
        const jurisdictions = matrix.jurisdictions.slice();
        jurisdictions[columnIndex] = value;
        return { ...matrix, jurisdictions };
      });
    },
    [updateMatrix]
  );

  const handleMatrixAddRow = React.useCallback(() => {
    updateMatrix((matrix) => {
      const cells = matrix.jurisdictions.map(() => ({ value: "" }));
      const newRow = {
        question: `New question ${matrix.rows.length + 1}`,
        cells,
      };
      return { ...matrix, rows: [...matrix.rows, newRow] };
    });
  }, [updateMatrix]);

  const handleMatrixAddColumn = React.useCallback(() => {
    updateMatrix((matrix) => {
      const newJurisdiction = `Jurisdiction ${matrix.jurisdictions.length + 1}`;
      const jurisdictions = [...matrix.jurisdictions, newJurisdiction];
      const rows = matrix.rows.map((row) => ({
        ...row,
        cells: [...row.cells, { value: "" }],
      }));
      return { jurisdictions, rows };
    });
  }, [updateMatrix]);

  const handleDocModeChange = React.useCallback(
    (mode: "template" | "upload") => {
      setDocModalMode(mode);
      if (mode === "template") {
        const info = DOCUMENT_TEMPLATES[docModalTemplate];
        setDocModalKind(info.kind);
        setDocModalFile(null);
        setDocModalFileContent(null);
      } else {
        setDocModalKind("memo");
        setDocModalFile(null);
        setDocModalFileContent(null);
      }
    },
    [docModalTemplate]
  );

  const handleDocTemplateChange = React.useCallback(
    (template: TemplateKey) => {
      setDocModalTemplate(template);
      const info = DOCUMENT_TEMPLATES[template];
      setDocModalKind(info.kind);
      setDocModalFile(null);
      setDocModalFileContent(null);
      if (!docModalNameTouched) {
        const suffix = documents.length + 1;
        setDocModalName(`${info.name} ${suffix}`);
      }
    },
    [docModalNameTouched, documents.length]
  );

  const handleDocNameChange = React.useCallback((value: string) => {
    setDocModalName(value);
    setDocModalNameTouched(true);
  }, []);

  const handleDocUploadChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setDocModalFile(file);
      setDocModalFileContent(null);
      if (file) {
        if (!docModalNameTouched) {
          const base = file.name.replace(/\.[^.]+$/, "") || "Uploaded Document";
          setDocModalName(base);
        }
        if (file.type.startsWith("text/") || /\.txt$/i.test(file.name)) {
          const reader = new FileReader();
          reader.onload = () => {
            setDocModalFileContent(typeof reader.result === "string" ? reader.result : null);
          };
          reader.onerror = () => setDocModalFileContent(null);
          reader.readAsText(file);
        }
      }
      e.target.value = "";
    },
    [docModalNameTouched]
  );

  const handleDocModalConfirm = React.useCallback(() => {
    if (docModalMode === "upload" && !docModalFile) return;
    const trimmedName = docModalName.trim() || DOCUMENT_TEMPLATES[docModalTemplate].name;
    let kind: DocumentKind;
    let content = "";
    let matrix: MatrixDocument | undefined;

  if (docModalMode === "template") {
    const info = DOCUMENT_TEMPLATES[docModalTemplate];
    kind = info.kind;
    if (info.kind === "matrix" && info.matrix) {
      matrix = cloneMatrix(info.matrix);
      content = info.content ?? "";
    } else {
      content = info.content ?? "";
    }
  } else {
      kind = docModalKind;
      const fallbackName = docModalFile?.name ?? trimmedName;
      const fallbackText = `Uploaded file: ${fallbackName}`;
      const fallbackContent = `<p><strong>Uploaded file:</strong> ${escapeHtml(fallbackName)}</p>`;
      content =
        docModalFileContent && docModalFileContent.trim().length > 0
          ? paragraphsFrom(docModalFileContent, fallbackText)
          : fallbackContent;
    }

    const timestamp = new Date().toISOString();
    const id = `doc-${Date.now()}`;
    setDocuments((prev) => [
      {
        id,
        name: trimmedName,
        kind,
        content: content ?? "",
        ...(matrix ? { matrix } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...prev,
    ]);
    setActiveDocumentId(id);
    setWorkspaceSourceId(null);
    openSourcePreview(null);
    closeDocumentModal();
  }, [
    closeDocumentModal,
    docModalFile,
    docModalFileContent,
    docModalKind,
    docModalMode,
    docModalName,
    docModalTemplate,
    openSourcePreview,
  ]);

  const handleSourceFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSourceModalFile(file);
    setSourceModalPreview(null);
    if (file) {
      if (file.type.startsWith("text/") || /\.txt$/i.test(file.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = typeof reader.result === "string" ? reader.result.trim() : "";
          setSourceModalPreview(text ? text.slice(0, 600) : null);
        };
        reader.onerror = () => setSourceModalPreview(null);
        reader.readAsText(file);
      }
    }
    e.target.value = "";
  }, []);

  const handleSourceModalConfirm = React.useCallback(() => {
    if (!sourceModalFile) return;
    const file = sourceModalFile;
    const id = `src-${Date.now()}`;
    const href = `source://${id}`;
    const preview =
      sourceModalPreview && sourceModalPreview.trim().length > 0
        ? sourceModalPreview
        : defaultPreviewForSource(file.name, sourceModalCategory);
    const src: SourceItem = {
      id,
      name: file.name,
      kind: extToKind(file.name),
      category: sourceModalCategory,
      addedAt: new Date().toISOString(),
      href,
      missing: false,
      origin: "upload",
      preview,
    };
    setSources((prev) => [src, ...prev]);
    const folderLabel =
      sourceModalCategory === "facts"
        ? "Facts"
        : sourceModalCategory === "laws"
        ? "Laws & Authority"
        : sourceModalCategory === "explanations"
        ? "Explanations"
        : "Prior Work";
    openSourcePreview(src.id);
    closeSourceModal();
    setTimeout(() => {
      postAssistant(`Uploaded ${file.name} to the ${folderLabel} folder.`);
    }, 0);
  }, [
    closeSourceModal,
    openSourcePreview,
    postAssistant,
    sourceModalCategory,
    sourceModalFile,
    sourceModalPreview,
  ]);

  React.useEffect(() => {
    if (!activeDocument || activeDocument.kind === "matrix") return;
    const content = activeDocument.content ?? "";
    if (!content) return;
    const anchors = deriveSectionAnchors(content);
    setValidationIssues((prev) => {
      let changed = false;
      const next = prev.map((issue) => {
        let replacement: string | null = null;
        if (issue.id === "issue-1") replacement = anchors.issue ?? null;
        if (issue.id === "issue-2") replacement = anchors.facts ?? null;
        if (issue.id === "issue-3") replacement = anchors.analysis ?? null;
        if (!replacement || replacement === issue.findPattern) {
          return issue;
        }
        changed = true;
        return { ...issue, findPattern: replacement, excerpt: replacement };
      });
      return changed ? next : prev;
    });
  }, [activeDocument]);

  const toggleJurisdiction = React.useCallback((code: string) => {
    setWizardJurisdictions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  const toggleCategory = React.useCallback((name: string) => {
    setWizardCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }, []);

  const handleFinishWizard = React.useCallback(() => {
    if (wizardDocName) {
      const finalPreview = buildWizardDocPreview({
        fileName: wizardDocName,
        issue: wizardIssue,
        jurisdictions: wizardJurisdictions,
        categories: wizardCategories,
        client: wizardClient,
      });
      setWizardDocPreview(finalPreview);
      if (activeDocument && activeDocument.kind !== "matrix") {
        const timestamp = new Date().toISOString();
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === activeDocument.id
              ? { ...doc, name: wizardDocName, content: finalPreview, updatedAt: timestamp }
              : doc
          )
        );
      }
    }
    setShowOnboarding(false);
    setWizardStep(0);
  }, [activeDocument, wizardCategories, wizardClient, wizardDocName, wizardIssue, wizardJurisdictions]);

  const handleWizardLibraryUpload = (file: File, category: SourceCategory) => {
    const id = `wiz-${Date.now()}`;
    const href = `source://${id}`;
    const src: SourceItem = {
      id,
      name: file.name,
      kind: extToKind(file.name),
      category,
      addedAt: new Date().toISOString(),
      href,
      missing: false,
      origin: "upload",
      preview: defaultPreviewForSource(file.name, category),
    };
    setSources((prev) => [src, ...prev]);
    setWizardLibraryUploads((prev) => [{ name: file.name, category }, ...prev]);
  };

  React.useEffect(() => {
    if (!wizardDocName) return;
    setWizardDocPreview(
      buildWizardDocPreview({
        fileName: wizardDocName,
        issue: wizardIssue,
        jurisdictions: wizardJurisdictions,
        categories: wizardCategories,
        client: wizardClient,
      })
    );
  }, [wizardCategories, wizardClient, wizardDocName, wizardIssue, wizardJurisdictions]);

  const handleInsertSourceLink = React.useCallback(
    (source: SourceItem) => {
      if (!activeDocument || activeDocument.kind === "matrix") {
        setActiveTab("chat");
        postAssistant("I'll support dropping citations directly into matrices soon. Please paste the reference into the grid for now.");
        return;
      }
      const href = source.href ?? `source://${source.id}`;
      if (!source.href || source.missing) {
        setSources((prev) =>
          prev.map((item) => (item.id === source.id ? { ...item, href, missing: false } : item))
        );
      }
      editorRef.current?.insertLink(source.name, href);
      setActiveTab("chat");
      postAssistant(`Linked to source: ${source.name}`);
    },
    [activeDocument, postAssistant]
  );

  React.useEffect(() => {
    if (!activeDocument || activeDocument.kind === "matrix") return;
    const content = activeDocument.content ?? "";
    const links = parseLinksFromDocument(content);
    setSources((prev) => {
      let changed = false;
      const next: SourceItem[] = [];
      const seenIds = new Set<string>();
      const seenKeys = new Set<string>();

      for (const item of prev) {
        let keep = true;
        if (item.origin === "link" && item.missing && item.href) {
          const normalizedKey = item.href.toLowerCase().startsWith("source://")
            ? item.href.toLowerCase()
            : normalizeHref(item.href);
          if (!links.has(normalizedKey)) {
            keep = false;
            changed = true;
          }
        }
        if (keep) {
          const clone = { ...item };
          next.push(clone);
          seenIds.add(clone.id);
          if (clone.href) {
            const key = clone.href.toLowerCase().startsWith("source://")
              ? clone.href.toLowerCase()
              : normalizeHref(clone.href);
            seenKeys.add(key);
          }
        }
      }

      for (const [key, link] of links) {
        if (link.type === "source" && link.sourceId) {
          const existing = next.find((item) => item.id === link.sourceId);
          if (existing) {
            if (!existing.href) {
              existing.href = link.href;
              changed = true;
            }
            if (existing.missing) {
              existing.missing = false;
              changed = true;
            }
            continue;
          }
        }

        if (link.type === "external" && seenKeys.has(key)) continue;

        const existingByHref =
          link.type === "external"
            ? next.find((item) => item.href && normalizeHref(item.href) === key)
            : undefined;

        if (existingByHref) {
          if (existingByHref.missing && link.type === "external") {
            // still missing until resolved manually
          }
          continue;
        }

        const id =
          link.type === "source" && link.sourceId
            ? link.sourceId
            : `missing-${hashString(link.href)}`;

        if (seenIds.has(id)) continue;

        const name = link.label || deriveNameFromHref(link.href);

        next.push({
          id,
          name,
          kind: "other",
          category: "facts",
          addedAt: new Date().toISOString(),
          href: link.href,
          missing: true,
          origin: "link",
          preview: defaultPreviewForSource(name, "facts"),
        });
        seenIds.add(id);
        seenKeys.add(key);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [activeDocument]);

  const handleRecAct = (rec: Recommendation) => {
    setRecs((rs) => rs.map((r) => (r.id === rec.id ? { ...r, status: "in_progress" as RecStatus } : r)));

    if (rec.intent === "add_evidence") {
      setActiveTab("chat");
      postAssistant(`Let's add evidence for: ${rec.title}.`);
      postAssistant("Please provide a document. You can upload a file.");
      setMessages((prev) => [
        ...prev,
        <div key={`prompt-${prev.length}`} className="ml-0">
          <UploadPromptCard onPick={() => fileRef.current?.click()} />
        </div>,
      ]);
      return;
    }

    if (rec.intent === "draft") {
      setActiveTab("chat");
      postAssistant("What would you like me to draft? (for example, 'Reconciliation paragraph for Section 3')");
      setAwaitingDraftSpec(true);
      setTimeout(() => chatInputRef.current?.focus(), 0);
      return;
    }

    if (rec.intent === "re_score" || rec.intent === "re_analyze") {
      setActiveTab("validate");
      postAssistant("Re-scoring citations and updating section risk...");
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAwaitingDraftSpec(false);
    pendingSourcesRef.current = [];
    setTimeout(() => chatInputRef.current?.focus(), 0);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input;
    const attachedSources = selectedAttachmentIds
      .map((id) => sources.find((src) => src.id === id))
      .filter((src): src is SourceItem => Boolean(src));
    const attachmentsLabel = attachedSources.map((src) => src.name).join(", ");
    const isDraftRequest = /draft/i.test(msg);

    setMessages((prev) => {
      const next = [...prev, <Bubble role="user" key={`u-${prev.length}`}>{msg}</Bubble>];
      if (!awaitingDraftSpec && attachedSources.length) {
        next.push(
          <Bubble role="ai" key={`ai-attach-${prev.length}`}>Attaching {attachmentsLabel} for this question.</Bubble>
        );
      }
      return next;
    });
    setInput("");
    setShowAttachmentPicker(false);

    if (awaitingDraftSpec) {
      setAwaitingDraftSpec(false);
      const text = SAMPLE_EDIT_TEXT(msg);
      if (attachedSources.length > 0) {
        queueSourcesForDraft(attachedSources);
      }
      setMessages((prev) => [
        ...prev,
        <Bubble role="ai" key={`ai-draftprep-${prev.length}`}>Generating an edit based on your request...</Bubble>,
        <div key={`edit-${prev.length}`} className="ml-0">
          <EditCard
            text={text}
            onInsert={() => {
              editorRef.current?.insertAtSection("Analysis", text);
              flushQueuedSourcesIntoEditor();
              setMessages((pp) => [
                ...pp,
                <Bubble role="ai" key={`audit-${pp.length}`}>Inserted edit into <strong>Analysis</strong> section.</Bubble>,
              ]);
            }}
          />
        </div>,
      ]);
      setActiveTab("chat");
      return;
    }

    if (isDraftRequest) {
      const text = SAMPLE_EDIT_TEXT(msg);
      queueSourcesForDraft(attachedSources);
      setMessages((prev) => [
        ...prev,
        <Bubble role="ai" key={`ai-draftattachments-${prev.length}`}>Drafting content with attached sources...</Bubble>,
        <div key={`edit-${prev.length}`} className="ml-0">
          <EditCard
            text={text}
            onInsert={() => {
              editorRef.current?.insertAtSection("Analysis", text);
              flushQueuedSourcesIntoEditor();
              setMessages((pp) => [
                ...pp,
                <Bubble role="ai" key={`audit-${pp.length}`}>Inserted edit into <strong>Analysis</strong> section.</Bubble>,
              ]);
            }}
          />
        </div>,
      ]);
      return;
    }

    setTimeout(() => {
      setMessages((prev) => {
        const cites = attachedSources.length
          ? attachedSources.map((src) => (
              <div key={`cite-${src.id}`}>
                <strong>{src.name}:</strong> {src.preview?.slice(0, 140) ?? "Summary not available"}
              </div>
            ))
          : [
              <div key="default-cite">
                <strong>Baseline sources:</strong> NJ facilitator guidance, prior memo snippets.
              </div>,
            ];

        const next = [
          ...prev,
          <Bubble role="ai" key={`ai-msg-${prev.length}`}>
            <div className="space-y-2">
              <div className="font-medium">Cited answer</div>
              <div className="text-sm text-muted-foreground">Key points referenced from your attachments.</div>
              <div className="space-y-1 text-sm">{cites}</div>
            </div>
          </Bubble>,
        ];

        if (attachedSources.length) {
          const text = SAMPLE_EDIT_TEXT(`Follow-up on ${attachmentsLabel}`);
          queueSourcesForDraft(attachedSources);
          next.push(
            <Bubble role="ai" key={`ai-followup-${next.length}`}>Need more detail? I can draft an insert based on those cites.</Bubble>,
            <div key={`followup-edit-${next.length}`} className="ml-0">
              <EditCard
                text={text}
                onInsert={() => {
                  editorRef.current?.insertAtSection("Analysis", text);
                  flushQueuedSourcesIntoEditor();
                  setMessages((pp) => [
                    ...pp,
                    <Bubble role="ai" key={`audit-followup-${pp.length}`}>
                      Inserted follow-up edit into <strong>Analysis</strong> with cited sources.
                    </Bubble>,
                  ]);
                }}
              />
            </div>
          );
        }
        return next;
      });
    }, 300);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveTab("chat");
    const id = `src-${Date.now()}`;
    const href = `source://${id}`;
    const src: SourceItem = {
      id,
      name: file.name,
      kind: extToKind(file.name),
      category: "facts",
      addedAt: new Date().toISOString(),
      href,
      missing: false,
      origin: "upload",
      preview: defaultPreviewForSource(file.name, "facts"),
    };
    setSources((prev) => {
      const filtered = prev.filter((item) => item.id !== id && item.href !== href);
      return [src, ...filtered];
    });

    setMessages((prev) => [
      ...prev,
      <Bubble role="user" key={`upload-${prev.length}`}>
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4" /> {file.name}
        </div>
      </Bubble>,
      <Bubble role="ai" key={`extract-note-${prev.length}`}>Extracted citables and saved to the Library. Re-analyzed affected sections.</Bubble>,
      <Bubble role="ai" key={`ask-draft-${prev.length}`}>Would you like me to draft content to add to the memo? If yes, tell me what to draft.</Bubble>,
    ]);

    setAwaitingDraftSpec(true);
    queueSourcesForDraft([src]);
    setRecs((rr) => rr.map((r) => (r.intent === "add_evidence" ? { ...r, status: "evidence_added" as RecStatus } : r)));
    setSelectedAttachmentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setShowAttachmentPicker(false);

    e.target.value = "";
  };

  const selectIssue = (i: ValidationIssue) => {
    setSelectedIssue(i);
    const hit =
      editorRef.current?.highlightText(i.findPattern) ||
      (i.excerpt && editorRef.current?.highlightText(i.excerpt)) ||
      false;
    if (!hit) {
      postAssistant("Couldn't locate that text in the memo. Please scroll manually.");
    }
    if (i.sourceId) {
      openSourcePreview(i.sourceId, i.sourceExcerpt ?? null);
    }
  };

  const fixIssueWithAI = (i: ValidationIssue) => {
    setActiveTab("chat");
    postAssistant(`I'll draft a fix for: ${i.title}`);
    const replacement = i.autoFix;
    const previewText = replacement
      ? `Replace: "${i.excerpt}" -> ${replacement}`
      : `Suggested edit: ${i.fixOptions[0] ?? "Please revise this passage manually."}`;

    setMessages((prev) => [
      ...prev,
      <div key={`edit-${prev.length}`} className="ml-0">
        <EditCard
          text={previewText}
          onInsert={() => {
            if (!replacement) {
              postAssistant("I don't have an auto-fix ready yet. Please make the edit manually.");
              return;
            }
            const plain = editorRef.current?.getPlainText() ?? "";
            const normalize = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
            if (!normalize(plain).includes(normalize(i.findPattern))) {
              postAssistant("Couldn't locate the text to replace. Please highlight it and try again.");
              return;
            }
            editorRef.current?.replaceText(i.findPattern, replacement);
            setMessages((pp) => [
              ...pp,
              <Bubble role="ai" key={`audit-fix-${pp.length}`}>Applied fix for <strong>{i.title}</strong> in the editor.</Bubble>,
            ]);
            setValidationIssues((vv) => vv.filter((x) => x.id !== i.id));
            setValidationScore((s) => Math.min(100, s + 4));
          }}
        />
      </div>,
    ]);
  };

  const makeBold = () => {
    editorRef.current?.toggleBold();
  };

  const makeItalic = () => {
    editorRef.current?.toggleItalic();
  };

  const makeH2 = () => {
    editorRef.current?.toggleHeading(2);
  };

  const makeList = () => {
    editorRef.current?.toggleBulletList();
  };

  const toggleActionCompletion = React.useCallback(
    (id: string, completed: boolean) => {
      setRecs((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (completed) {
            actionStatusMemory.current.set(id, item.status);
            return { ...item, status: "closed" as RecStatus };
          }
          const fallback = actionStatusMemory.current.get(id);
          const restored =
            fallback && fallback !== "closed" ? fallback : ("suggested" as RecStatus);
          return { ...item, status: restored };
        })
      );
    },
    []
  );

  const docModalReady =
    docModalMode === "template"
      ? docModalName.trim().length > 0
      : docModalName.trim().length > 0 && Boolean(docModalFile);

  const sourceModalReady = Boolean(sourceModalFile);

  const stepOneReady = wizardIssue.trim().length > 0 && Boolean(wizardClient);

  return (
    <TooltipProvider>
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="w-full max-w-3xl bg-card text-card-foreground rounded-xl shadow-xl border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                {wizardStep === 0 ? "Tell us about the matter" : "Add starting materials"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {wizardStep === 0
                  ? "Capture the basics so the workspace is tailored to your memo."
                  : "Optionally drop in documents and seed the source library before you start drafting."}
              </p>
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {wizardStep === 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue focus</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Describe the question the memo needs to answer..."
                      value={wizardIssue}
                      onChange={(e) => setWizardIssue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jurisdictions</label>
                    <div className="flex flex-wrap gap-2">
                      {JURISDICTION_OPTIONS.map((code) => (
                        <Button
                          key={code}
                          type="button"
                          size="sm"
                          variant={wizardJurisdictions.includes(code) ? "default" : "outline"}
                          onClick={() => toggleJurisdiction(code)}
                          className="whitespace-nowrap"
                        >
                          {code}
                        </Button>
                      ))}
                    </div>
                    {wizardJurisdictions.length === 0 && (
                      <p className="text-xs text-muted-foreground">Pick at least one jurisdiction to anchor the analysis.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <Button
                          key={cat}
                          type="button"
                          size="sm"
                          variant={wizardCategories.includes(cat) ? "default" : "outline"}
                          onClick={() => toggleCategory(cat)}
                          className="whitespace-nowrap"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={wizardClient ?? ""}
                      onChange={(e) => setWizardClient(e.target.value || null)}
                    >
                      <option value="" disabled>
                        Select a client
                      </option>
                      {CLIENT_OPTIONS.map((client) => (
                        <option key={client.id} value={client.name}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {wizardStep === 1 && (
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-[3] space-y-3 border rounded-lg p-4 bg-muted/50">
                    <div>
                      <h3 className="text-sm font-medium">Kick off your draft</h3>
                      <p className="text-xs text-muted-foreground">
                        Upload the starting brief and glance at its contents before loading it into the editor.
                      </p>
                    </div>
                    <label className="flex w-full flex-col gap-2 text-sm">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Upload starting document</span>
                      <input
                        type="file"
                        className="w-full text-sm file:mr-3 file:rounded file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setWizardDocName(file.name);
                          setWizardDocPreview(
                            buildWizardDocPreview({
                              fileName: file.name,
                              issue: wizardIssue,
                              jurisdictions: wizardJurisdictions,
                              categories: wizardCategories,
                              client: wizardClient,
                            })
                          );
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <div className="text-xs text-muted-foreground space-y-2 min-h-[220px]">
                      {wizardDocName ? (
                        <>
                          <div>
                            Selected start document:{" "}
                            <span className="font-medium text-foreground">{wizardDocName}</span>
                          </div>
                          <div className="rounded-md border border-dashed border-muted p-3 bg-background text-sm leading-6 min-h-[180px]">
                            {wizardDocPreview ? (
                              <>
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Preview (loaded into editor when you finish)
                                </div>
                                <div
                                  className="mt-2 max-h-48 overflow-auto rounded bg-muted/40 px-3 py-2 text-sm leading-6 space-y-2"
                                  dangerouslySetInnerHTML={{ __html: wizardDocPreview }}
                                />
                              </>
                            ) : (
                              <div className="text-muted-foreground text-sm">Generating preview…</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-dashed border-muted p-4 bg-background text-sm text-muted-foreground min-h-[180px] flex items-center justify-center text-center">
                          Upload a document to see the preview here.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 border rounded-lg p-4 bg-muted/30">
                    <div>
                      <h3 className="text-sm font-medium">Attach supporting files</h3>
                      <p className="text-xs text-muted-foreground">
                        Drop in workpapers, rulings, or prior memos so they’re ready to cite.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={wizardLibraryCategory}
                        onChange={(e) => setWizardLibraryCategory(e.target.value as SourceCategory)}
                      >
                        <option value="facts">Facts</option>
                        <option value="laws">Laws</option>
                        <option value="explanations">Explanations</option>
                        <option value="prior">Prior</option>
                      </select>
                      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wide">Upload supporting file</span>
                        <input
                          type="file"
                          className="text-sm file:mr-3 file:rounded file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            handleWizardLibraryUpload(file, wizardLibraryCategory);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <div className="rounded-md border border-dashed border-muted p-3 bg-background min-h-[160px] overflow-auto">
                      {wizardLibraryUploads.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Nothing uploaded yet. Use the control above to attach sources by folder.
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          {wizardLibraryUploads.map((item, idx) => (
                            <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                              <div className="truncate font-medium text-foreground">{item.name}</div>
                              <span className="uppercase tracking-wide text-muted-foreground">{item.category}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Step {wizardStep + 1} of 2
                </span>
              </div>
              <div className="flex items-center gap-2">
                {wizardStep === 1 && (
                  <Button type="button" variant="outline" onClick={() => setWizardStep(0)}>
                    Back
                  </Button>
                )}
                {wizardStep === 0 && (
                  <Button type="button" onClick={() => setWizardStep(1)} disabled={!stepOneReady}>
                    Next
                  </Button>
                )}
                {wizardStep === 1 && (
                  <Button type="button" onClick={handleFinishWizard}>
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">Create document</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a template or upload a document to add it to this project.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDocumentModal} aria-label="Close document dialog">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document name</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={docModalName}
                  onChange={(e) => handleDocNameChange(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Creation mode</span>
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary focus:ring-primary"
                      checked={docModalMode === "template"}
                      onChange={() => handleDocModeChange("template")}
                    />
                    Use template
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary focus:ring-primary"
                      checked={docModalMode === "upload"}
                      onChange={() => handleDocModeChange("upload")}
                    />
                    Upload file
                  </label>
                </div>
              </div>

              {docModalMode === "template" ? (
                <div className="grid gap-2">
                  {DOCUMENT_TEMPLATE_OPTIONS.map((opt) => {
                    const selected = docModalTemplate === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                          selected ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                          checked={selected}
                          onChange={() => handleDocTemplateChange(opt.value)}
                        />
                        <div>
                          <div className="text-sm font-medium">{opt.title}</div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document type</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={docModalKind}
                      onChange={(e) => setDocModalKind(e.target.value as DocumentKind)}
                    >
                      {Object.entries(DOCUMENT_KIND_LABELS)
                        .filter(([value]) => value !== "matrix")
                        .map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload file</label>
                    <input
                      type="file"
                      className="w-full text-sm file:mr-3 file:rounded file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer"
                      onChange={handleDocUploadChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      {docModalFile
                        ? `Selected file: ${docModalFile.name}`
                        : "Supported text files will import their contents automatically."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="ghost" onClick={closeDocumentModal}>
                Cancel
              </Button>
              <Button onClick={handleDocModalConfirm} disabled={!docModalReady}>
                Create document
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">Add source</h2>
                <p className="text-sm text-muted-foreground">
                  Upload supporting material and choose where it belongs in the library.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeSourceModal} aria-label="Close source dialog">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source category</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sourceModalCategory}
                  onChange={(e) => setSourceModalCategory(e.target.value as SourceCategory)}
                >
                  <option value="facts">Facts</option>
                  <option value="laws">Laws</option>
                  <option value="explanations">Explanations</option>
                  <option value="prior">Prior work</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload file</label>
                <input
                  type="file"
                  className="w-full text-sm file:mr-3 file:rounded file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer"
                  onChange={handleSourceFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  {sourceModalFile ? `Selected file: ${sourceModalFile.name}` : "Choose a file to add it to the library."}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Preview</span>
                <div className="rounded-md border border-muted bg-muted/30 p-2 text-xs max-h-40 overflow-auto whitespace-pre-wrap">
                  {sourceModalPreview
                    ? sourceModalPreview
                    : sourceModalFile
                    ? "Preview not available for this file type."
                    : "Select a file to see a quick preview."}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="ghost" onClick={closeSourceModal}>
                Cancel
              </Button>
              <Button onClick={handleSourceModalConfirm} disabled={!sourceModalReady}>
                Add source
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-screen bg-background text-foreground flex flex-col">
        <div className="px-3 py-2 border-b flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold truncate max-w-[420px]" title={projectBreadcrumb}>
            <span className="truncate">{projectName}</span>
            {activeDocument && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="truncate text-sm font-medium text-muted-foreground">{activeDocument.name}</span>
              </>
            )}
          </div>
          <Separator orientation="vertical" className="h-5" />

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={makeBold}>
                  <Bold className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={makeItalic}>
                  <Italic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={makeH2}>
                  <Heading2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading level 2</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={makeList}>
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bulleted list</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => alert("Saved (mock)")}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save (mock)</TooltipContent>
            </Tooltip>
          </div>

          <div className="ml-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="validate">Validate</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          {showLibrary ? (
            <div className="relative">
              <LibrarySidebar
                documents={documents}
                activeDocumentId={activeDocument?.id ?? null}
                onSelectDocument={handleSelectDocument}
                onCreateDocument={openDocumentModal}
                onUploadSource={openSourceModal}
                onOpenInWorkspace={openSourceInWorkspace}
                sources={sources}
                query={libQuery}
                categoryFilter={libCategory}
                onQuery={setLibQuery}
                onCategory={setLibCategory}
                onInsertLink={handleInsertSourceLink}
                selectedSource={selectedSource}
                onSelectSource={handleSelectSource}
                onClosePreview={() => openSourcePreview(null)}
                sourceHighlight={sourceHighlight}
              />
              <div className="absolute top-2 -right-3 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => setShowLibrary(false)}
                      aria-label="Collapse library"
                    >
                      <PanelLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Collapse library</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="w-6 border-r bg-muted/30 flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setShowLibrary(true)}
                    aria-label="Expand library"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show library</TooltipContent>
              </Tooltip>
            </div>
          )}
          <div className={`${editorFlexClass} min-w-0 min-h-0 relative`}>
            {activeDocument?.kind === "matrix" && activeMatrix ? (
              <MatrixEditor
                matrix={activeMatrix}
                onChangeJurisdiction={handleMatrixJurisdictionChange}
                onChangeQuestion={handleMatrixQuestionChange}
                onChangeCell={handleMatrixCellChange}
                onAddRow={handleMatrixAddRow}
                onAddColumn={handleMatrixAddColumn}
              />
            ) : (
              <MemoSimpleEditor
                ref={editorRef as React.Ref<EditorHandle>}
                value={activeDocumentContent}
                onChange={setActiveDocumentContent}
              />
            )}
            {workspaceSource && (
              <div className="absolute inset-0 z-30 flex flex-col bg-background">
                <div className="px-4 py-3 border-b space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" className="gap-1" onClick={closeWorkspaceSource}>
                      <ChevronLeft className="w-4 h-4" /> Back to document
                    </Button>
                    <div className="flex items-center gap-2">
                      {workspaceSource.href && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(workspaceSource.href ?? "#", "_blank", "noopener,noreferrer")}
                          aria-label="Open source link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="text-sm sm:text-base font-semibold leading-6 break-words text-foreground">
                        {workspaceSource.name}
                      </div>
                      {workspaceSource.href && (
                        <div className="text-[11px] text-muted-foreground break-all leading-4">
                          {workspaceSource.href.replace(/^https?:\/\//, "")}
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleInsertSourceLink(workspaceSource)}
                      aria-label="Cite source"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="px-4 py-2 border-b text-xs text-muted-foreground flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {workspaceSource.category === "prior" ? "Prior work" : workspaceSource.category}
                  </Badge>
                  <span>Uploaded {new Date(workspaceSource.addedAt).toLocaleDateString()}</span>
                </div>
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-3 text-sm leading-6">
                    {workspaceSourcePreview.length === 0 ? (
                      <div className="text-muted-foreground">No preview available for this source.</div>
                    ) : (
                      workspaceSourcePreview.map((para, idx) => (
                        <p key={`workspace-source-${idx}`} className="text-muted-foreground whitespace-pre-wrap break-words">
                          {para}
                        </p>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {showRightPanel ? (
            <div className="relative flex-[2] min-w-[360px] max-w-[640px] border-l flex flex-col">
              <div className="absolute top-2 -left-3 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => setShowRightPanel(false)}
                      aria-label="Collapse detail panel"
                    >
                      <PanelRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Collapse side panel</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex-1 flex flex-col min-h-0 relative">
                {showAttachmentPicker && (
                  <div className="absolute bottom-28 left-3 right-3 z-20 rounded-lg border bg-background shadow-xl">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <div className="text-sm font-semibold">Attach sources</div>
                      <div className="flex items-center gap-2">
                        {attachmentsActive && (
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAttachmentIds([])}>
                            Clear
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={closeAttachmentPicker} aria-label="Close selector">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="max-h-72 px-3 py-3 space-y-4">
                      {folderOrder.map((cat) => {
                        const items = groupedSources[cat];
                        if (!items || items.length === 0) return null;
                        const label = categoryLabels[cat];
                        return (
                          <div key={cat} className="space-y-2">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
                            <div className="flex flex-col gap-1">
                              {items.map((src) => {
                                const checked = selectedAttachmentIds.includes(src.id);
                                return (
                                  <label
                                    key={src.id}
                                    className={`flex items-center gap-2 rounded border px-2 py-1 text-sm ${
                                      checked ? "border-primary bg-primary/5" : "border-muted"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4"
                                      checked={checked}
                                      onChange={() => toggleAttachmentSelection(src.id)}
                                    />
                                    <span className="truncate">{src.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {sources.length === 0 && (
                        <div className="text-sm text-muted-foreground">No uploads yet. Add a file to attach.</div>
                      )}
                    </ScrollArea>
                    <div className="px-3 py-2 border-t flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          closeAttachmentPicker();
                          fileRef.current?.click();
                        }}
                      >
                        Upload new
                      </Button>
                      <Button size="sm" onClick={closeAttachmentPicker}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === "chat" && (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex flex-col gap-4 px-3 py-4 h-full overflow-auto">
                        {messages.length === 0 && (
                          <Card className="border-muted/60">
                            <CardHeader className="py-3">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Suggested next steps
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {recs
                                  .filter((r) => r.status !== "closed")
                                  .slice(0, 3)
                                  .map((r) => (
                                    <Button
                                      key={r.id}
                                      size="sm"
                                      variant="secondary"
                                      className="h-auto px-3 py-2 whitespace-normal text-left text-xs leading-5 items-start justify-start gap-2"
                                      onClick={() => handleRecAct(r)}
                                    >
                                      <Lightbulb className="w-3.5 h-3.5 mr-1" /> {r.title}
                                    </Button>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {messages.map((m, i) => (
                          <div key={i}>{m}</div>
                        ))}
                        <div ref={chatBottomRef} />
                      </div>
                    </div>

                    <div className="px-3 py-2 border-y bg-muted/30">
                      <RecommendationsDock items={recs} onAct={handleRecAct} />
                    </div>

                    <div className="border-t px-3 py-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant={attachmentsActive ? "secondary" : "outline"}
                          size="sm"
                          className="gap-2"
                          onClick={() => setShowAttachmentPicker((prev) => !prev)}
                        >
                          <Paperclip className="w-4 h-4" />
                          {attachmentsActive ? `${selectedAttachmentIds.length} attached` : "Attach"}
                        </Button>
                        {attachmentsActive && (
                          <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
                            {selectedAttachments.slice(0, 2).map((src) => (
                              <span key={`chip-${src.id}`} className="px-2 py-1 rounded-full bg-muted">
                                {src.name}
                              </span>
                            ))}
                            {selectedAttachments.length > 2 && (
                              <span className="px-2 py-1 rounded-full bg-muted">
                                +{selectedAttachments.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          ref={chatInputRef}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Ask the sidekick..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearChat}
                          disabled={messages.length === 0}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Clear
                        </Button>
                        <Button onClick={handleSend}>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "actions" && (
                  <>
                    <AllActionsPanel
                      items={recs}
                      onAct={handleRecAct}
                      onToggleAction={toggleActionCompletion}
                      onSelectSource={handleSelectFileSource}
                      isTransitioning={isTransitioning}
                      transitionThoughts={transitionThoughts}
                      currentThought={currentThought}
                      recentThoughts={recentThoughts}
                      currentPhase={currentPhase}
                      onPhaseChange={handlePhaseChange}
                    />
                  </>
                )}

                {activeTab === "validate" && (
                  <ValidatePanel
                    score={validationScore}
                    issues={validationIssues}
                    selectedId={selectedIssue?.id}
                    onSelect={selectIssue}
                    onFix={fixIssueWithAI}
                  />
                )}

                {activeTab === "workflow" && (
                  <ActionWorkflow />
                )}
              </div>
            </div>
          ) : (
            <div className="w-6 border-l bg-muted/30 flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setShowRightPanel(true)}
                    aria-label="Expand detail panel"
                  >
                    <PanelRightOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show side panel</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

type MatrixEditorProps = {
  matrix: MatrixDocument;
  onChangeJurisdiction: (columnIndex: number, value: string) => void;
  onChangeQuestion: (rowIndex: number, value: string) => void;
  onChangeCell: (rowIndex: number, columnIndex: number, value: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
};

function MatrixEditor({
  matrix,
  onChangeJurisdiction,
  onChangeQuestion,
  onChangeCell,
  onAddRow,
  onAddColumn,
}: MatrixEditorProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Matrix workspace</h2>
          <p className="text-xs text-muted-foreground">
            Compare jurisdictional answers row-by-row and capture supporting citations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddColumn}>
            Add column
          </Button>
          <Button size="sm" onClick={onAddRow}>
            Add row
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="min-w-max">
          <table className="border-collapse text-sm">
            <thead>
              <tr className="align-top">
                <th className="border border-muted bg-muted/70 px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground w-60">
                  Legal question
                </th>
                {matrix.jurisdictions.map((jurisdiction, colIdx) => (
                  <th key={`matrix-head-${colIdx}`} className="border border-muted bg-muted/50 px-2 py-2 text-left">
                    <input
                      value={jurisdiction}
                      onChange={(e) => onChangeJurisdiction(colIdx, e.target.value)}
                      className="w-48 rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, rowIdx) => (
                <tr key={`matrix-row-${rowIdx}`} className="align-top">
                  <td className="border border-muted bg-background px-2 py-2">
                    <textarea
                      value={row.question}
                      onChange={(e) => onChangeQuestion(rowIdx, e.target.value)}
                      className="w-60 min-h-[72px] resize-y rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="State the legal question…"
                    />
                  </td>
                  {matrix.jurisdictions.map((_, colIdx) => (
                    <td key={`matrix-cell-${rowIdx}-${colIdx}`} className="border border-muted bg-background px-2 py-2">
                      <textarea
                        value={row.cells[colIdx]?.value ?? ""}
                        onChange={(e) => onChangeCell(rowIdx, colIdx, e.target.value)}
                        className="w-56 min-h-[72px] resize-y rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Add answer & cite authority…"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-4 py-2 border-t text-xs text-muted-foreground">
        Tip: capture citations directly in each cell (e.g., “Cite: N.J.S.A. 54:32B-3.6”). Use the controls above to add
        more jurisdictions or questions as your analysis evolves.
      </div>
    </div>
  );
}
