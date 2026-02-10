'use client'

import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Circle, Clock, TrendingUp, User } from 'lucide-react';
import { Badge } from '@/ui';
import type { Task } from './ai-task-prioritizer';

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskClick?: (task: Task) => void;
}

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

export const TaskCard = memo(function TaskCard({ task, index, onTaskClick }: TaskCardProps) {
  const priorityColor = useMemo(
    () => getPriorityColor(task.priorityScore),
    [task.priorityScore]
  );
  const priorityBg = useMemo(
    () => getPriorityBg(task.priorityScore),
    [task.priorityScore]
  );
  const handleClick = useCallback(() => {
    onTaskClick?.(task);
  }, [onTaskClick, task]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={handleClick}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${priorityBg}
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
            <div className={`flex items-center gap-1 ml-2 flex-shrink-0 ${priorityColor}`}>
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
                  <span className="font-semibold">Suggested owner: </span>
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
  );
});
