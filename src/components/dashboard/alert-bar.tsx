'use client'

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/ui';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  priority: number; // 0-100 (urgency × impact)
  reasoning: string;
  prediction?: {
    label: string;
    value: string;
    confidence: number;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertBarProps {
  alerts: Alert[];
  maxVisible?: number;
}

export function AlertBar({ alerts, maxVisible = 3 }: AlertBarProps) {
  const sortedAlerts = [...alerts]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxVisible);

  if (sortedAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-app-success-bg dark:bg-app-dark-success-bg border border-app-success/20 dark:border-app-dark-success/20 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-app-success/20 dark:bg-app-dark-success/20">
            <Info className="w-5 h-5 text-app-success dark:text-app-dark-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-app-text dark:text-app-dark-text">All Clear</p>
            <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
              No urgent items detected. AI is monitoring your fund operations.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-app-danger dark:text-app-dark-danger" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-app-warning dark:text-app-dark-warning" />;
      default:
        return <Info className="w-5 h-5 text-app-info dark:text-app-dark-info" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-app-danger-bg dark:bg-app-dark-danger-bg border-app-border dark:border-app-dark-border';
      case 'warning':
        return 'bg-app-warning-bg dark:bg-app-dark-warning-bg border-app-border dark:border-app-dark-border';
      default:
        return 'bg-app-info-bg dark:bg-app-dark-info-bg border-app-border dark:border-app-dark-border';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-app-danger dark:text-app-dark-danger';
    if (priority >= 50) return 'text-app-warning dark:text-app-dark-warning';
    return 'text-app-info dark:text-app-dark-info';
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-app-text dark:text-app-dark-text flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-app-warning dark:text-app-dark-warning" />
          AI-Prioritized Alerts
        </h3>
        <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
          Sorted by urgency × impact
        </span>
      </div>

      {sortedAlerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title + Priority Score */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-app-text dark:text-app-dark-text">
                  {alert.title}
                </h4>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-app-surface/50 dark:bg-app-dark-surface/50">
                  <TrendingDown className={`w-3 h-3 ${getPriorityColor(alert.priority)}`} />
                  <span className={`text-xs font-bold ${getPriorityColor(alert.priority)}`}>
                    {Math.round(alert.priority)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted mb-3">
                {alert.description}
              </p>

              {/* AI Reasoning */}
              <div className="flex items-start gap-2 p-2 rounded bg-app-surface/50 dark:bg-app-dark-surface/50 mb-3">
                <Info className="w-3 h-3 text-app-text-subtle dark:text-app-dark-text-subtle mt-0.5 flex-shrink-0" />
                <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">
                  <span className="font-semibold">Why critical: </span>
                  {alert.reasoning}
                </p>
              </div>

              {/* Prediction */}
              {alert.prediction && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded bg-app-primary/5 dark:bg-app-dark-primary/5 border border-app-border dark:border-app-dark-border">
                  <div className="flex-1">
                    <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-0.5">
                      {alert.prediction.label}
                    </p>
                    <p className="text-sm font-semibold text-app-text dark:text-app-dark-text">
                      {alert.prediction.value}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">Confidence</p>
                    <p className="text-sm font-bold text-app-primary dark:text-app-dark-primary">
                      {Math.round(alert.prediction.confidence * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {alert.action && (
                <Button
                  size="sm"
                  onClick={alert.action.onClick}
                  className="text-xs"
                >
                  {alert.action.label}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {alerts.length > maxVisible && (
        <p className="text-xs text-center text-app-text-subtle dark:text-app-dark-text-subtle pt-2">
          +{alerts.length - maxVisible} more alert{alerts.length - maxVisible > 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}
