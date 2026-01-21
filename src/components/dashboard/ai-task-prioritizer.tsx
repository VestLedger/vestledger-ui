'use client'

import { useMemo } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Card, Badge } from '@/ui';
import { TaskCard } from './task-card';

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
            <div className="p-2 rounded-lg bg-app-primary/10 dark:bg-app-dark-primary/10">
              <Sparkles className="w-5 h-5 text-app-primary dark:text-app-dark-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-app-text dark:text-app-dark-text">
                AI-Prioritized Tasks
              </h3>
              <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
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
            <CheckCircle className="w-12 h-12 text-app-success dark:text-app-dark-success mx-auto mb-3" />
            <p className="text-sm font-semibold text-app-text dark:text-app-dark-text mb-1">
              All tasks completed!
            </p>
            <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
              You&apos;re all caught up for today
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
          <div className="pt-3 border-t border-app-border dark:border-app-dark-border">
            <p className="text-xs text-center text-app-text-subtle dark:text-app-dark-text-subtle">
              {completedTasks.length} task{completedTasks.length > 1 ? 's' : ''} completed today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
