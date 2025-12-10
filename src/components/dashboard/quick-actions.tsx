'use client'

import { motion } from 'framer-motion';
import { Sparkles, Send, FileText, Users, DollarSign, BarChart, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/ui';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  aiSuggested: boolean;
  confidence?: number;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  // Sort: AI-suggested first, then by confidence
  const sortedActions = [...actions].sort((a, b) => {
    if (a.aiSuggested && !b.aiSuggested) return -1;
    if (!a.aiSuggested && b.aiSuggested) return 1;
    if (a.aiSuggested && b.aiSuggested) {
      return (b.confidence || 0) - (a.confidence || 0);
    }
    return 0;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--app-text)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
          Quick Actions
        </h3>
        <span className="text-xs text-[var(--app-text-subtle)]">
          AI-suggested actions appear first
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={action.onClick}
                className={`
                  relative w-full p-4 rounded-lg border transition-all duration-200
                  ${action.aiSuggested
                    ? 'bg-gradient-to-br from-[var(--app-primary)]/10 to-[var(--app-accent)]/5 border-[var(--app-border)] hover:border-[var(--app-primary)]/40'
                    : 'bg-[var(--app-surface)] border-[var(--app-border)] hover:border-[var(--app-primary)]/30'
                  }
                  hover:shadow-lg
                `}
              >
                {/* AI Badge */}
                {action.aiSuggested && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--app-primary)]/20">
                      <Sparkles className="w-3 h-3 text-[var(--app-primary)]" />
                      {action.confidence && (
                        <span className="text-xs font-bold text-[var(--app-primary)]">
                          {Math.round(action.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  ${action.aiSuggested
                    ? 'bg-[var(--app-primary)]/20'
                    : 'bg-[var(--app-surface-hover)]'
                  }
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${action.aiSuggested
                      ? 'text-[var(--app-primary)]'
                      : 'text-[var(--app-text-muted)]'
                    }
                  `} />
                </div>

                {/* Label */}
                <h4 className="text-sm font-semibold text-[var(--app-text)] mb-1 text-left">
                  {action.label}
                </h4>

                {/* Description */}
                <p className="text-xs text-[var(--app-text-muted)] text-left line-clamp-2">
                  {action.description}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Conversational Fallback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-3 rounded-lg bg-[var(--app-surface)] border border-[var(--app-border)]"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[var(--app-text-muted)] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-[var(--app-text-muted)]">
              Need something else?{' '}
              <button className="text-[var(--app-primary)] hover:underline font-medium">
                Ask AI Copilot
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Export common action creators for convenience
export const createQuickAction = {
  sendReminder: (onClick: () => void): QuickAction => ({
    id: 'send-reminder',
    label: 'Send Reminder',
    description: 'Email overdue LPs',
    icon: Send,
    aiSuggested: true,
    confidence: 0.92,
    onClick,
  }),

  draftCapitalCall: (onClick: () => void): QuickAction => ({
    id: 'draft-capital-call',
    label: 'Draft Capital Call',
    description: 'Generate call notice',
    icon: DollarSign,
    aiSuggested: true,
    confidence: 0.88,
    onClick,
  }),

  generateReport: (onClick: () => void): QuickAction => ({
    id: 'generate-report',
    label: 'Generate Report',
    description: 'Portfolio health summary',
    icon: FileText,
    aiSuggested: false,
    onClick,
  }),

  contactLP: (onClick: () => void): QuickAction => ({
    id: 'contact-lp',
    label: 'Contact LP',
    description: 'View LP directory',
    icon: Users,
    aiSuggested: false,
    onClick,
  }),

  viewAnalytics: (onClick: () => void): QuickAction => ({
    id: 'view-analytics',
    label: 'View Analytics',
    description: 'Deep dive into metrics',
    icon: BarChart,
    aiSuggested: false,
    onClick,
  }),
};
