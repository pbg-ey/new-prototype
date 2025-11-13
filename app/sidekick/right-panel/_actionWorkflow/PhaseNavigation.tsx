import * as React from "react";
import { ChevronRight, ChevronDown, CheckCircle, RefreshCw } from "lucide-react";

export type WorkflowCategoryDisplay = {
  id: string;
  name: string;
  description: string;
  color: string;
  dynamic?: boolean;
  progress: {
    completed: number;
    total: number;
  };
};

interface PhaseNavigationProps {
  categories: WorkflowCategoryDisplay[];
  activeCategory: string;
  newPhaseId: string;
  onPrev: () => void;
  onNext: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectNewPhase: () => void;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function PhaseNavigation({
  categories,
  activeCategory,
  newPhaseId,
  onPrev,
  onNext,
  onSelectCategory,
  onSelectNewPhase,
  showDropdown,
  onToggleDropdown,
  onCloseDropdown,
  dropdownRef,
}: PhaseNavigationProps) {
  const currentCategory = React.useMemo(
    () => categories.find((cat) => cat.id === activeCategory),
    [categories, activeCategory]
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="group flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 transition-colors hover:bg-gray-50"
          aria-label="Previous phase"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>

        <div className="relative flex min-w-0 flex-1" ref={dropdownRef}>
          {activeCategory === newPhaseId ? (
            <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
              <span className="text-sm font-semibold text-gray-700">Create New Section</span>
              <span className="mt-1 text-xs text-gray-500">
                Complete the form below to add another workflow phase.
              </span>
            </div>
          ) : currentCategory ? (
            <div className="flex w-full flex-col justify-between rounded-xl border bg-gray-50 p-4 shadow-sm transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={onToggleDropdown}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-900"
                    type="button"
                  >
                    <span className="truncate">{currentCategory.name}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {currentCategory.description}
                  </p>
                </div>
                <div className="shrink-0">
                  {currentCategory.progress.total > 0 &&
                  currentCategory.progress.completed === currentCategory.progress.total ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <RefreshCw className="h-4 w-4 animate-pulse text-gray-400" />
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gray-600 transition-all"
                    style={{
                      width: `${
                        currentCategory.progress.total > 0
                          ? Math.round(
                              (currentCategory.progress.completed /
                                currentCategory.progress.total) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {currentCategory.progress.total > 0
                    ? Math.round(
                        (currentCategory.progress.completed /
                          currentCategory.progress.total) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-md border bg-white shadow-lg">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onSelectCategory(category.id);
                        onCloseDropdown();
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                        activeCategory === category.id
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="font-medium">{category.name}</div>
                      <div className="mt-0.5 text-gray-500">{category.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <button
          onClick={onNext}
          className="group flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-600 transition-colors hover:bg-gray-50"
          aria-label="Next phase or new phase"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const isCompleted =
            category.progress.completed === category.progress.total &&
            category.progress.total > 0;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`h-1.5 rounded-full transition-all ${
                isActive
                  ? "w-4 bg-gray-600"
                  : isCompleted
                  ? "w-1.5 bg-green-500"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to ${category.name}`}
            />
          );
        })}
        <button
          onClick={onSelectNewPhase}
          className={`h-1.5 w-4 rounded-full border border-dashed transition-colors ${
            activeCategory === newPhaseId ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          aria-label="Create new phase"
        />
      </div>
    </div>
  );
}
