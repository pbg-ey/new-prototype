import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, X } from "lucide-react";

import {
  AIThoughtStep,
  PhaseInsight,
  WorkflowAction,
} from "./ActionWorkflowTypes";

interface AiInsightsPanelProps {
  show: boolean;
  onClose: () => void;
  categoryName?: string;
  phaseInsights?: PhaseInsight;
  thoughts: AIThoughtStep[];
  actions: WorkflowAction[];
  nextSteps: string[];
}

export function AiInsightsPanel({
  show,
  onClose,
  categoryName,
  phaseInsights,
  thoughts,
  actions,
  nextSteps,
}: AiInsightsPanelProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col border border-blue-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        show ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Brain className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">AI Strategic Insights</p>
            <p className="text-xs text-blue-600">{categoryName ?? "Current Phase"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Collapse AI insights"
          onClick={onClose}
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
              <p className="text-sm leading-relaxed text-blue-900">{phaseInsights.goal}</p>
              <p className="text-xs leading-relaxed text-blue-700/80">{phaseInsights.alignment}</p>
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
              <p className="text-sm leading-relaxed text-blue-900">{phaseInsights.approach}</p>
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
            {thoughts.slice(0, 5).map((thought) => (
              <div key={thought.id} className="rounded-lg border border-blue-100 bg-blue-50/80 p-3">
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
                      <h5 className="text-xs font-semibold text-blue-900">{thought.title}</h5>
                      {thought.confidence && (
                        <span className="text-[10px] font-medium text-blue-700/80">
                          {thought.confidence}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-blue-900/90">{thought.content}</p>
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
            {thoughts.length === 0 && (
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
            {actions.map((action) => (
              <div key={action.id} className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-blue-900">{action.title}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {action.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-blue-800">
                  {action.aiReasoning?.reasoning ?? "This action supports the overall workflow progression for this phase."}
                </p>
              </div>
            ))}
            {actions.length === 0 && (
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
            {nextSteps.map((step, index) => (
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
  );
}
