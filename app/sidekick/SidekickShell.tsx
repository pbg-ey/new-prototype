"use client";

import * as React from "react";
import {
  Bold,
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Recommendation, SourceItem, SourceCategory, ValidationIssue } from "./type";
import dynamic from "next/dynamic";
import type { EditorHandle } from "./editor/SimpleEditor";
import { LibrarySidebar } from "./library/LibrarySidebar";
import { useAutoScroll } from "./utils/ui";
import { AllActionsPanel } from "./right-panel/ActionsPanel";
import { ValidatePanel } from "./right-panel/ValidatePanel";
import { Bubble } from "./right-panel/_shared/Bubble";
import { EditCard } from "./right-panel/_shared/EditCard";
import { UploadPromptCard } from "./right-panel/_shared/UploadPromptCard";
import { RecommendationsDock } from "./right-panel/_shared/RecommendationsDock";

type RecStatus = Recommendation["status"];

const INITIAL_RECS: Recommendation[] = [
  {
    id: "rec-1",
    title: "Add evidence: NJ marketplace facilitator nexus (2023-2025)",
    intent: "add_evidence",
    priority: "high",
    status: "suggested",
    context: { section: "Analysis", issue: "Nexus", jurisdictions: ["NJ"] },
  },
  {
    id: "rec-2",
    title: "Draft reconciliation paragraph about conflicting rulings",
    intent: "draft",
    priority: "med",
    status: "evidence_added",
    context: { section: "Analysis", issue: "Exemptions", jurisdictions: ["NY"] },
  },
  {
    id: "rec-3",
    title: "Re-score citations in Section 3 after new upload",
    intent: "re_score",
    priority: "low",
    status: "ready_to_draft",
    context: { section: "Law", issue: "Digital goods", jurisdictions: ["NY"] },
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
    category: "explanations",
    addedAt: "2024-04-02T10:00:00.000Z",
    href: "https://www.state.nj.us/treasury/taxation/pdf/pubs/sales/st-18.pdf",
    missing: false,
    origin: "upload",
    preview: SAMPLE_SOURCE_CONTENT.guidance,
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
  const [activeTab, setActiveTab] = React.useState<"chat" | "actions" | "validate">("chat");
  const [projectName] = React.useState("Acme Retail - AI Tax Advisory");
  const [sources, setSources] = React.useState<SourceItem[]>(INITIAL_SOURCES);
  const [selectedSourceId, setSelectedSourceId] = React.useState<string | null>(null);
  const [sourceHighlight, setSourceHighlight] = React.useState<string | null>(null);
  const [libQuery, setLibQuery] = React.useState("");
  const [libCategory, setLibCategory] = React.useState<"all" | SourceCategory>("all");
  const [doc, setDoc] = React.useState(INITIAL_DOC);
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

  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const libFileRef = React.useRef<HTMLInputElement | null>(null);
  const editorRef = React.useRef<EditorHandle | null>(null);
  const pendingSourcesRef = React.useRef<SourceItem[]>([]);
  const selectedSource = React.useMemo(
    () => sources.find((s) => s.id === selectedSourceId) ?? null,
    [sources, selectedSourceId]
  );
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
  }, []);

  const handleSelectSource = React.useCallback(
    (src: SourceItem) => {
      openSourcePreview(src.id);
    },
    [openSourcePreview]
  );

  React.useEffect(() => {
    if (!doc) return;
    const anchors = deriveSectionAnchors(doc);
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
  }, [doc]);

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

  const postAssistant = React.useCallback(
    (text: string) => setMessages((prev) => [...prev, <Bubble role="ai" key={`ai-${prev.length}`}>{text}</Bubble>]),
    []
  );

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
      setDoc(finalPreview);
    }
    setShowOnboarding(false);
    setWizardStep(0);
  }, [wizardCategories, wizardClient, wizardDocName, wizardIssue, wizardJurisdictions]);

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
    [postAssistant]
  );

  React.useEffect(() => {
    const links = parseLinksFromDocument(doc);
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
  }, [doc]);

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

  const dismissRec = (id: string) => {
    setRecs((rs) => rs.map((r) => (r.id === id ? { ...r, status: "closed" as RecStatus } : r)));
    const rec = recs.find((r) => r.id === id);
    if (rec) {
      postAssistant(`Dismissed action: ${rec.title}`);
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

  const handleLibFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      <Bubble role="ai" key={`libadd-${prev.length}`}>Added <strong>{file.name}</strong> to the Library.</Bubble>,
    ]);
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

      <div className="w-full h-screen bg-background text-foreground flex flex-col">
        <div className="px-3 py-2 border-b flex items-center gap-3">
          <div className="font-semibold truncate max-w-[320px]">{projectName}</div>
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
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          {showLibrary ? (
            <div className="relative">
              <LibrarySidebar
                sources={sources}
                query={libQuery}
                categoryFilter={libCategory}
                onQuery={setLibQuery}
                onCategory={setLibCategory}
                onPickFile={() => libFileRef.current?.click()}
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
          <input ref={libFileRef} type="file" className="hidden" onChange={handleLibFile} />

          <div className={`${editorFlexClass} min-w-0 min-h-0`}>
            <MemoSimpleEditor ref={editorRef as React.Ref<EditorHandle>} value={doc} onChange={setDoc} />
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
                  <AllActionsPanel items={recs} onAct={handleRecAct} onDismiss={dismissRec} />
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
