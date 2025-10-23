"use client";

import * as React from "react";
import { Bold, Heading2, Italic, List, Lightbulb, Paperclip, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation, CitationFinding, SourceItem, SourceCategory, ValidationIssue } from "./type";
import { MemoSimpleEditor, EditorHandle } from "./editor/SimpleEditor";
import { LibrarySidebar } from "./library/LibrarySidebar";
import { useAutoScroll, findRange } from "./utils/ui";
import { AllActionsPanel } from "./right-panel/ActionsPanel";
import { ValidatePanel } from "./right-panel/ValidatePanel";
import { Bubble } from "./right-panel/_shared/Bubble";
import { EditCard } from "./right-panel/_shared/EditCard";
import { UploadPromptCard } from "./right-panel/_shared/UploadPromptCard";
import { ClaimReviewCard } from "./right-panel/_shared/ClaimReviewCard";
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

const MOCK_FINDINGS: CitationFinding[] = [
  {
    id: "c1",
    citation: "N.J.S.A. 54:32B-3 (2024)",
    veracity: 0.84,
    pertinence: 0.72,
    risk: 0.22,
    signals: ["primary", "current"],
  },
  {
    id: "c2",
    citation: "Doe v. Dept. of Tax, 2021 WL 12345 (App. Div.)",
    veracity: 0.58,
    pertinence: 0.41,
    risk: 0.59,
    signals: ["persuasive", "fact_mismatch"],
  },
  {
    id: "c3",
    citation: "NY TSB-M-20(2)S (Digital Products)",
    veracity: 0.67,
    pertinence: 0.88,
    risk: 0.3,
    signals: ["admin_guidance", "high_relevance"],
  },
];

const MOCK_ISSUES: ValidationIssue[] = [
  {
    id: "i1",
    title: "Irrelevant citation in Issues section",
    type: "irrelevant",
    severity: "low",
    section: "Issues",
    excerpt: "Treatment of digital goods in NY.",
    findPattern: "Treatment of digital goods in NY.",
    fixOptions: [
      "Move this to Background or delete if not relied upon.",
      "Tie the issue to client facts (sales channels, product catalog).",
    ],
  },
  {
    id: "i2",
    title: "Possible misinterpretation of NJ statute threshold",
    type: "misinterpretation",
    severity: "med",
    section: "Facts",
    excerpt: "marketplace facilitating sales of digital goods.",
    findPattern: "marketplace facilitating sales of digital goods.",
    fixOptions: [
      "Cite current NJ economic nexus thresholds explicitly.",
      "Clarify facilitator obligations vs. vendor obligations.",
    ],
  },
  {
    id: "i3",
    title: "Misapplication: facilitator rule applied to non-facilitated sales",
    type: "misapplication",
    severity: "high",
    section: "Analysis",
    excerpt: "(placeholder)",
    findPattern: "(placeholder)",
    fixOptions: [
      "Separate facilitated vs direct sales and apply rules only where applicable.",
      "Add a caveat noting mixed transaction handling.",
    ],
  },
];

const SAMPLE_EDIT_TEXT = (spec: string) =>
  `**Marketplace Facilitator Nexus (New Jersey).** Under N.J.S.A. 54:32B-3 and implementing guidance, a marketplace facilitator that exceeds the statutory economic threshold is treated as the vendor responsible for collecting and remitting sales tax on facilitated sales. The client's platform meets facilitation criteria (payment processing, fulfillment coordination, and listing control) and exceeded the threshold in CY2024. Accordingly, the safer position is to register and collect prospectively while filing a protective return for prior quarters. See also NJ Division of Taxation bulletins addressing digital goods and facilitator liability. (Drafted per: "${spec}")`;

function extToKind(filename: string): SourceItem["kind"] {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "rtf"].includes(ext)) return "doc";
  return "other";
}

type ParsedLink = {
  href: string;
  label?: string;
  type: "external" | "source";
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
  const links = new Map<string, ParsedLink>();

  const addLink = (rawHref: string, label?: string) => {
    if (!rawHref) return;
    const cleaned = rawHref.trim();
    if (!cleaned) return;
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

  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let mdMatch: RegExpExecArray | null;
  while ((mdMatch = markdownLinkRegex.exec(text)) !== null) {
    addLink(mdMatch[2], mdMatch[1]);
  }

  const bareLinkRegex = /(https?:\/\/[^\s)]+)/g;
  let bareMatch: RegExpExecArray | null;
  while ((bareMatch = bareLinkRegex.exec(text)) !== null) {
    addLink(bareMatch[1]);
  }

  return links;
}

export function SidekickShell() {
  const [recs, setRecs] = React.useState<Recommendation[]>(INITIAL_RECS);
  const [messages, setMessages] = React.useState<React.ReactNode[]>([]);
  const [input, setInput] = React.useState("");
  const [awaitingDraftSpec, setAwaitingDraftSpec] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"chat" | "actions" | "validate">("chat");
  const [projectName] = React.useState("Acme Retail - AI Tax Advisory");
  const [sources, setSources] = React.useState<SourceItem[]>([]);
  const [libQuery, setLibQuery] = React.useState("");
  const [libCategory, setLibCategory] = React.useState<"all" | SourceCategory>("all");
  const [doc, setDoc] = React.useState(
    [
      "# Client Tax Memo",
      "",
      "## Facts",
      "Client operates an online marketplace facilitating sales of digital goods.",
      "",
      "## Issues",
      "1. Whether the client triggered economic nexus as a marketplace facilitator in NJ.",
      "2. Treatment of digital goods in NY.",
      "",
      "## Analysis",
      "(placeholder)",
      "",
      "## Conclusion",
      "(placeholder)",
    ].join("\n")
  );
  const [validationScore, setValidationScore] = React.useState(82);
  const [validationIssues, setValidationIssues] = React.useState<ValidationIssue[]>(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = React.useState<ValidationIssue | null>(null);

  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);
  const chatInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const libFileRef = React.useRef<HTMLInputElement | null>(null);
  const editorRef = React.useRef<EditorHandle | null>(null);

  useAutoScroll(messages.length, activeTab === "chat", chatBottomRef);

  const postAssistant = React.useCallback(
    (text: string) => setMessages((prev) => [...prev, <Bubble role="ai" key={`ai-${prev.length}`}>{text}</Bubble>]),
    []
  );

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

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages((prev) => [...prev, <Bubble role="user" key={`u-${prev.length}`}>{msg}</Bubble>]);
    setInput("");

    if (awaitingDraftSpec) {
      setAwaitingDraftSpec(false);
      const text = SAMPLE_EDIT_TEXT(msg);
      setMessages((prev) => [
        ...prev,
        <Bubble role="ai" key={`ai-draftprep-${prev.length}`}>Generating an edit based on your request...</Bubble>,
        <div key={`edit-${prev.length}`} className="ml-0">
          <EditCard
            text={text}
            onInsert={() => {
              editorRef.current?.insertAtSection("Analysis", text);
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

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        <Bubble role="ai" key={`ai-msg-${prev.length}`}>Analyzing your selection. Here are current citation risks and next steps.</Bubble>,
        <div key={`ai-card-${prev.length}`} className="ml-0">
          <ClaimReviewCard items={MOCK_FINDINGS} onOpenSlide={() => setActiveTab("validate")} />
        </div>,
      ]);
    }, 300);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveTab("chat");
    const src: SourceItem = {
      id: `src-${Date.now()}`,
      name: file.name,
      kind: extToKind(file.name),
      category: "facts",
      addedAt: new Date().toISOString(),
    };
    setSources((prev) => [src, ...prev]);

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
    setRecs((rr) => rr.map((r) => (r.intent === "add_evidence" ? { ...r, status: "evidence_added" as RecStatus } : r)));

    e.target.value = "";
  };

  const handleLibFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src: SourceItem = {
      id: `src-${Date.now()}`,
      name: file.name,
      kind: extToKind(file.name),
      category: "facts",
      addedAt: new Date().toISOString(),
    };
    setSources((prev) => [src, ...prev]);
    setMessages((prev) => [
      ...prev,
      <Bubble role="ai" key={`libadd-${prev.length}`}>Added <strong>{file.name}</strong> to the Library.</Bubble>,
    ]);
    e.target.value = "";
  };

  const selectIssue = (i: ValidationIssue) => {
    setSelectedIssue(i);
    const range = findRange(doc, i.findPattern);
    if (range) editorRef.current?.highlightRange(range.start, range.end);
  };

  const fixIssueWithAI = (i: ValidationIssue) => {
    setActiveTab("chat");
    postAssistant(`I'll draft a fix for: ${i.title}`);
    const range = findRange(doc, i.findPattern);
    const replacement =
      i.type === "irrelevant"
        ? "This issue is not central to the taxpayer's fact pattern and is removed to improve focus."
        : i.type === "misinterpretation"
        ? "The client's platform meets the NJ facilitator definition; economic nexus threshold is $100,000 or 200 transactions (confirm current threshold) and collection duties attach accordingly."
        : "Apply facilitator rules only to facilitated transactions; direct sales remain subject to vendor rules with separate nexus analysis.";

    const previewText = `Replace: "${i.excerpt}" -> ${replacement}`;

    setMessages((prev) => [
      ...prev,
      <div key={`edit-${prev.length}`} className="ml-0">
        <EditCard
          text={previewText}
          onInsert={() => {
            if (range) {
              editorRef.current?.replaceRange(range.start, range.end, replacement);
              setMessages((pp) => [
                ...pp,
                <Bubble role="ai" key={`audit-fix-${pp.length}`}>Applied fix for <strong>{i.title}</strong> in the editor.</Bubble>,
              ]);
              setValidationIssues((vv) => vv.filter((x) => x.id !== i.id));
              setValidationScore((s) => Math.min(100, s + 4));
            } else {
              postAssistant("Couldn't locate the text to replace. Please highlight it and try again.");
            }
          }}
        />
      </div>,
    ]);
  };

  const makeBold = () => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (!el || el.tagName.toLowerCase() !== "textarea") return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = doc.slice(0, start);
    const sel = doc.slice(start, end) || "bold";
    const after = doc.slice(end);
    const next = `${before}**${sel}**${after}`;
    setDoc(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + 2 + sel.length + 2;
      el.setSelectionRange(caret, caret);
    });
  };

  const makeItalic = () => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (!el || el.tagName.toLowerCase() !== "textarea") return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = doc.slice(0, start);
    const sel = doc.slice(start, end) || "italic";
    const after = doc.slice(end);
    const next = `${before}*${sel}*${after}`;
    setDoc(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + 1 + sel.length + 1;
      el.setSelectionRange(caret, caret);
    });
  };

  const makeH2 = () => {
    setDoc((d) => `## ${d}`);
  };

  const makeList = () => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (!el || el.tagName.toLowerCase() !== "textarea") return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = doc.slice(0, start);
    const sel = doc.slice(start, end) || "List item";
    const after = doc.slice(end);
    const next = `${before}- ${sel}${after}`;
    setDoc(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + 2 + sel.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <TooltipProvider>
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
          <LibrarySidebar
            sources={sources}
            query={libQuery}
            categoryFilter={libCategory}
            onQuery={setLibQuery}
            onCategory={setLibCategory}
            onPickFile={() => libFileRef.current?.click()}
          />
          <input ref={libFileRef} type="file" className="hidden" onChange={handleLibFile} />

          <div className="flex-[3] min-w-0 min-h-0">
            <MemoSimpleEditor ref={editorRef as React.Ref<EditorHandle>} value={doc} onChange={setDoc} />
          </div>

          <div className="flex-[2] min-w-[360px] max-w-[640px] border-l flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
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

                  <div className="border-t px-3 py-3 flex items-center gap-2">
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
                    <Button onClick={handleSend}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                    <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                  </div>

                  <RecommendationsDock items={recs} onAct={handleRecAct} />
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
        </div>
      </div>
    </TooltipProvider>
  );
}
