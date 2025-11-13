import { WorkflowAction, AIInsightData, PhaseInsight } from "./ActionWorkflowTypes";


export const MOCK_ACTIONS: WorkflowAction[] = [
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

export const MOCK_AI_INSIGHTS: AIInsightData = {
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

export const PHASE_INSIGHTS: Record<"facts" | "laws" | "analysis", PhaseInsight> = {
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