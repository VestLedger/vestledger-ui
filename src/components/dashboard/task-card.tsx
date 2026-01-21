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
  if (score >= 80) return 'text-app-danger dark:text-app-dark-danger';
  if (score >= 50) return 'text-app-warning dark:text-app-dark-warning';
  return 'text-app-info dark:text-app-dark-info';
};

const getPriorityBg = (score: number) => {
  if (score >= 80) return 'bg-app-danger-bg dark:bg-app-dark-danger-bg border-app-border dark:border-app-dark-border';
  if (score >= 50) return 'bg-app-warning-bg dark:bg-app-dark-warning-bg border-app-border dark:border-app-dark-border';
  return 'bg-app-info-bg dark:bg-app-dark-info-bg border-app-border dark:border-app-dark-border';
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
        hover:border-app-primary/40 dark:hover:border-app-dark-primary/40 hover:shadow-md
      `}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">
          {task.status === 'in_progress' ? (
            <div className="relative">
              <Circle className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0"
              >
                <Circle className="w-5 h-5 text-app-primary dark:text-app-dark-primary fill-app-primary/20 dark:fill-app-dark-primary/20" />
              </motion.div>
            </div>
          ) : (
            <Circle className="w-5 h-5 text-app-text-muted dark:text-app-dark-text-muted" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + Priority Score */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-app-text dark:text-app-dark-text flex-1">
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
          <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-2 line-clamp-2">
            {task.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs mb-2">
            <div className="flex items-center gap-1">
              <span className="text-app-text-subtle dark:text-app-dark-text-subtle">Urgency:</span>
              <span className="font-semibold text-app-text-muted dark:text-app-dark-text-muted">
                {task.urgency}/10
              </span>
            </div>
            <span className="text-app-text-subtle dark:text-app-dark-text-subtle">•</span>
            <div className="flex items-center gap-1">
              <span className="text-app-text-subtle dark:text-app-dark-text-subtle">Impact:</span>
              <span className="font-semibold text-app-text-muted dark:text-app-dark-text-muted">
                {task.impact}/10
              </span>
            </div>
            <span className="text-app-text-subtle dark:text-app-dark-text-subtle">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-app-text-muted dark:text-app-dark-text-muted" />
              <span className="text-app-text-muted dark:text-app-dark-text-muted">
                {task.estimatedTime}
              </span>
            </div>
          </div>

          {/* Delegation Suggestion */}
          {task.delegationSuggestion && (
            <div className="flex items-start gap-2 p-2 rounded bg-app-primary/5 dark:bg-app-dark-primary/5 border border-app-border dark:border-app-dark-border">
              <User className="w-3 h-3 text-app-primary dark:text-app-dark-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-app-text dark:text-app-dark-text mb-0.5">
                  <span className="font-semibold">AI Suggestion: </span>
                  Delegate to {task.delegationSuggestion.person}
                </p>
                <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
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
