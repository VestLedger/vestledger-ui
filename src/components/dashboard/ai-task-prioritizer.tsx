'use client'

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, TrendingUp, Sparkles, User } from 'lucide-react';
import { Card, Badge } from '@/ui';

export interface Task {
  id: string;
  title: string;
  description: string;
  urgency: number; // 0-10
  impact: number; // 0-10
  priorityScore: number; // urgency × impact
  estimatedTime: string; // e.g., "15 min", "2 hours"
  delegationSuggestion?: {
    person: string;
    reasoning: string;
  };
  status: 'pending' | 'in_progress' | 'completed';
}

interface AITaskPrioritizerProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function AITaskPrioritizer({ tasks, onTaskClick }: AITaskPrioritizerProps) {
  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-[var(--app-danger)]';
    if (score >= 50) return 'text-[var(--app-warning)]';
    return 'text-[var(--app-info)]';
  };

  const getPriorityBg = (score: number) => {
    if (score >= 80) return 'bg-[var(--app-danger-bg)] border-[var(--app-border)]';
    if (score >= 50) return 'bg-[var(--app-warning-bg)] border-[var(--app-border)]';
    return 'bg-[var(--app-info-bg)] border-[var(--app-border)]';
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--app-primary)]/10">
              <Sparkles className="w-5 h-5 text-[var(--app-primary)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">
                AI-Prioritized Tasks
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Ranked by urgency × impact
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="primary" size="sm">
              {sortedTasks.length} active
            </Badge>
            {completedTasks.length > 0 && (
              <Badge color="success" size="sm">
                {completedTasks.length} done
              </Badge>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-[var(--app-success)] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--app-text)] mb-1">
              All tasks completed!
            </p>
            <p className="text-xs text-[var(--app-text-muted)]">
              You're all caught up for today
            </p>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => onTaskClick?.(task)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                ${getPriorityBg(task.priorityScore)}
                hover:border-[var(--app-primary)]/40 hover:shadow-md
              `}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {task.status === 'in_progress' ? (
                    <div className="relative">
                      <Circle className="w-5 h-5 text-[var(--app-primary)]" />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0"
                      >
                        <Circle className="w-5 h-5 text-[var(--app-primary)] fill-[var(--app-primary)]/20" />
                      </motion.div>
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--app-text-muted)]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title + Priority Score */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-[var(--app-text)] flex-1">
                      {task.title}
                    </h4>
                    <div className={`flex items-center gap-1 ml-2 flex-shrink-0 ${getPriorityColor(task.priorityScore)}`}>
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {Math.round(task.priorityScore)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--app-text-muted)] mb-2 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--app-text-subtle)]">Urgency:</span>
                      <span className="font-semibold text-[var(--app-text-muted)]">
                        {task.urgency}/10
                      </span>
                    </div>
                    <span className="text-[var(--app-text-subtle)]">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--app-text-subtle)]">Impact:</span>
                      <span className="font-semibold text-[var(--app-text-muted)]">
                        {task.impact}/10
                      </span>
                    </div>
                    <span className="text-[var(--app-text-subtle)]">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--app-text-muted)]" />
                      <span className="text-[var(--app-text-muted)]">
                        {task.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {/* Delegation Suggestion */}
                  {task.delegationSuggestion && (
                    <div className="flex items-start gap-2 p-2 rounded bg-[var(--app-primary)]/5 border border-[var(--app-border)]">
                      <User className="w-3 h-3 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-[var(--app-text)] mb-0.5">
                          <span className="font-semibold">AI Suggestion: </span>
                          Delegate to {task.delegationSuggestion.person}
                        </p>
                        <p className="text-xs text-[var(--app-text-subtle)]">
                          {task.delegationSuggestion.reasoning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* In Progress Badge */}
                  {task.status === 'in_progress' && (
                    <div className="mt-2">
                      <Badge color="primary" size="sm">
                        In Progress
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && sortedTasks.length > 0 && (
          <div className="pt-3 border-t border-[var(--app-border)]">
            <p className="text-xs text-center text-[var(--app-text-subtle)]">
              {completedTasks.length} task{completedTasks.length > 1 ? 's' : ''} completed today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
