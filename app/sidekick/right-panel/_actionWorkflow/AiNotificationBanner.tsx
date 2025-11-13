'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, X, Sparkles, Clock } from "lucide-react";
import { AiNotification, PhaseRecommendation } from "./ActionWorkflowTypes";

interface AiNotificationBannerProps {
  notifications: AiNotification[];
  onDismiss: (notificationId: string) => void;
  onAcceptPhaseRecommendation: (recommendation: PhaseRecommendation) => void;
  onRejectPhaseRecommendation: (notificationId: string) => void;
}

export function AiNotificationBanner({
  notifications,
  onDismiss,
  onAcceptPhaseRecommendation,
  onRejectPhaseRecommendation,
}: AiNotificationBannerProps) {
  const activeNotifications = notifications.filter(n => !n.dismissed);
  
  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-3">
      {activeNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-3 ${
            notification.type === 'phase_suggestion'
              ? 'border-blue-200 bg-blue-50'
              : notification.type === 'actions_updated'
              ? 'border-green-200 bg-green-50'
              : notification.type === 'analysis_complete'
              ? 'border-purple-200 bg-purple-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              notification.type === 'phase_suggestion'
                ? 'bg-blue-100'
                : notification.type === 'actions_updated'
                ? 'bg-green-100'
                : notification.type === 'analysis_complete'
                ? 'bg-purple-100'
                : 'bg-gray-100'
            }`}>
              {notification.type === 'phase_suggestion' ? (
                <Sparkles className="h-3 w-3 text-blue-600" />
              ) : notification.type === 'actions_updated' ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : notification.type === 'analysis_complete' ? (
                <Brain className="h-3 w-3 text-purple-600" />
              ) : (
                <Clock className="h-3 w-3 text-gray-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${
                  notification.type === 'phase_suggestion'
                    ? 'text-blue-900'
                    : notification.type === 'actions_updated'
                    ? 'text-green-900'
                    : notification.type === 'analysis_complete'
                    ? 'text-purple-900'
                    : 'text-gray-900'
                }`}>
                  {notification.title}
                </h4>
                
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              <p className={`text-xs leading-relaxed ${
                notification.type === 'phase_suggestion'
                  ? 'text-blue-800'
                  : notification.type === 'actions_updated'
                  ? 'text-green-800'
                  : notification.type === 'analysis_complete'
                  ? 'text-purple-800'
                  : 'text-gray-700'
              }`}>
                {notification.message}
              </p>

              {/* Phase Recommendation Actions */}
              {notification.type === 'phase_suggestion' && notification.data && (
                <div className="mt-3 space-y-2">
                  <div className="rounded border border-blue-200 bg-blue-50/50 p-2">
                    <div className="text-xs font-medium text-blue-800 mb-1">
                      Suggested Phase: &quot;{notification.data.suggestedName}&quot;
                    </div>
                    <div className="text-xs text-blue-700 mb-2">
                      {notification.data.suggestedDescription}
                    </div>
                    <div className="text-xs text-blue-600">
                      <span className="font-medium">Reasoning:</span> {notification.data.reasoning}
                    </div>
                    {notification.data.confidence && (
                      <div className="text-xs text-blue-600 mt-1">
                        <span className="font-medium">Confidence:</span> {Math.round(notification.data.confidence * 100)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAcceptPhaseRecommendation(notification.data!)}
                      className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Create Phase
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRejectPhaseRecommendation(notification.id)}
                      className="h-6 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Not Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}