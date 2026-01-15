'use client'

import { motion } from 'framer-motion';
import { Check, Circle, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'blocked';
  aiPrediction?: {
    estimatedTime: string;
    confidence: number;
    bottleneckRisk?: 'high' | 'medium' | 'low';
  };
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[];
  orientation?: 'horizontal' | 'vertical';
  showPredictions?: boolean;
}

export function WorkflowStepper({
  steps,
  orientation = 'horizontal',
  showPredictions = true,
}: WorkflowStepperProps) {
  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <Check className="w-5 h-5 text-white" />;
      case 'current':
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle className="w-5 h-5 text-white fill-white" />
          </motion.div>
        );
      case 'blocked':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      default:
        return <Circle className="w-5 h-5 text-[var(--app-text-subtle)]" />;
    }
  };

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-[var(--app-success)]';
      case 'current':
        return 'bg-[var(--app-primary)]';
      case 'blocked':
        return 'bg-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface-hover)]';
    }
  };

  const getBottleneckColor = (risk: 'high' | 'medium' | 'low') => {
    switch (risk) {
      case 'high':
        return 'text-[var(--app-danger)]';
      case 'medium':
        return 'text-[var(--app-warning)]';
      default:
        return 'text-[var(--app-info)]';
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className="space-y-4" role="list" aria-label="Workflow steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex gap-4"
            role="listitem"
            aria-current={step.status === 'current' ? 'step' : undefined}
          >
            {/* Icon & Connector */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step)}`}>
                {getStepIcon(step)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 mt-2 ${
                  step.status === 'completed' ? 'bg-[var(--app-success)]' : 'bg-[var(--app-border)]'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <h4 className="text-sm font-semibold text-[var(--app-text)] mb-1">
                {step.label}
              </h4>
              {step.description && (
                <p className="text-xs text-[var(--app-text-muted)] mb-2">
                  {step.description}
                </p>
              )}

              {/* AI Prediction */}
              {showPredictions && step.aiPrediction && step.status !== 'completed' && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--app-primary)]/5 border border-[var(--app-primary)]/10">
                  <Sparkles className="w-3 h-3 text-[var(--app-primary)] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-[var(--app-text-muted)]" />
                      <span className="text-[var(--app-text-muted)]">
                        Est. {step.aiPrediction.estimatedTime}
                      </span>
                      {step.aiPrediction.bottleneckRisk && (
                        <>
                          <span className="text-[var(--app-text-subtle)]">•</span>
                          <span className={`font-semibold ${getBottleneckColor(step.aiPrediction.bottleneckRisk)}`}>
                            {step.aiPrediction.bottleneckRisk} risk
                          </span>
                        </>
                      )}
                      <span className="text-[var(--app-text-subtle)]">•</span>
                      <span className="text-[var(--app-primary)] font-semibold">
                        {Math.round(step.aiPrediction.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className="relative">
      <div className="flex items-center justify-between" role="list" aria-label="Workflow steps">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1"
              role="listitem"
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              {/* Step */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step)} transition-all`}>
                  {getStepIcon(step)}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    step.status === 'current' ? 'text-[var(--app-text)]' : 'text-[var(--app-text-muted)]'
                  }`}>
                    {step.label}
                  </p>

                  {/* AI Prediction */}
                  {showPredictions && step.aiPrediction && step.status !== 'completed' && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-[var(--app-text-muted)]" />
                      <span className="text-[var(--app-text-muted)]">
                        {step.aiPrediction.estimatedTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 relative">
                  <div className="absolute inset-0 bg-[var(--app-border)]" />
                  {step.status === 'completed' && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-[var(--app-success)]"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress Forecast */}
      {showPredictions && (
        <div className="mt-6 p-3 rounded-lg bg-[var(--app-surface)] border border-[var(--app-border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
            <p className="text-xs font-semibold text-[var(--app-text)]">
              AI Workflow Forecast
            </p>
          </div>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">
            {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed.
            Estimated time to completion: {steps
              .filter(s => s.status !== 'completed' && s.aiPrediction)
              .reduce((sum, s) => {
                const time = s.aiPrediction!.estimatedTime;
                const hours = time.includes('hour') ? parseInt(time) : 0;
                const days = time.includes('day') ? parseInt(time) : 0;
                return sum + (hours + days * 8);
              }, 0)} hours
          </p>
        </div>
      )}
    </div>
  );
}
