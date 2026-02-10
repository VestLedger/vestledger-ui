'use client'

import { useMemo } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Card, Badge } from '@/ui';
import { TaskCard } from './task-card';

export interface Task {
  id: string;
  title: string;
  description: string;
  domain?: 'capital-calls' | 'portfolio' | 'compliance' | 'operations' | 'reporting';
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
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AITaskPrioritizer({
  tasks,
  onTaskClick,
  title = 'Priority Task Queue',
  description = 'Ranked by urgency and impact',
  emptyTitle = 'No open tasks',
  emptyDescription = 'Current priorities are complete',
}: AITaskPrioritizerProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [tasks]);

  const completedTasks = useMemo(
    () => tasks.filter(t => t.status === 'completed'),
    [tasks]
  );

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
                {title}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                {description}
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
              {emptyTitle}
            </p>
            <p className="text-xs text-[var(--app-text-muted)]">
              {emptyDescription}
            </p>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onTaskClick={onTaskClick}
            />
          ))
        )}

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && sortedTasks.length > 0 && (
          <div className="pt-3 border-t border-[var(--app-border)]">
            <p className="text-xs text-center text-[var(--app-text-subtle)]">
              {completedTasks.length} task{completedTasks.length > 1 ? 's' : ''} completed in this cycle
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
