'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, GraduationCap } from 'lucide-react';
import { Card, Button, Progress, useToast } from '@/ui';
import { TaskChecklist } from '@/ui/composites';
import { useAuth } from '@/contexts/auth-context';
import { useUIKey } from '@/store/ui';
import {
  getRoleOnboardingPlan,
  type RoleOnboardingPlan,
} from '@/services/onboarding/roleOnboardingService';

type RoleOnboardingUIState = {
  dismissed: boolean;
  completedStepIds: string[];
};

export function RoleOnboardingBeacon() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [plan, setPlan] = useState<RoleOnboardingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roleKey = user?.role ?? 'guest';
  const { value: ui, patch: patchUI } = useUIKey<RoleOnboardingUIState>(
    `role-onboarding:${roleKey}`,
    {
      dismissed: false,
      completedStepIds: [],
    }
  );

  useEffect(() => {
    let cancelled = false;

    if (!user?.role) {
      setPlan(null);
      return;
    }

    setIsLoading(true);
    void getRoleOnboardingPlan(user.role)
      .then((nextPlan) => {
        if (!cancelled) {
          setPlan(nextPlan);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const completedStepSet = useMemo(() => new Set(ui.completedStepIds), [ui.completedStepIds]);
  const completedCount = plan
    ? plan.steps.filter((step) => completedStepSet.has(step.id)).length
    : 0;
  const totalSteps = plan?.steps.length ?? 0;
  const completionPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const markStep = (stepId: string, completed: boolean) => {
    const nextIds = new Set(ui.completedStepIds);
    if (completed) {
      nextIds.add(stepId);
    } else {
      nextIds.delete(stepId);
    }

    patchUI({ completedStepIds: Array.from(nextIds) });
  };

  const startNextStep = () => {
    if (!plan) return;
    const nextStep = plan.steps.find((step) => !completedStepSet.has(step.id));
    if (!nextStep) return;

    router.push(nextStep.route);
    toast.info(`Opening step: ${nextStep.title}`);
  };

  if (!user || !plan || isLoading) {
    return null;
  }

  if (completedCount >= totalSteps && totalSteps > 0) {
    return null;
  }

  if (ui.dismissed) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          variant="flat"
          className="shadow-md"
          startContent={<GraduationCap className="w-4 h-4" />}
          onPress={() => patchUI({ dismissed: false })}
        >
          Resume Onboarding
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card padding="md" className="border border-[var(--app-border)] shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              Role Onboarding
            </p>
            <h3 className="truncate text-sm font-semibold">{plan.title}</h3>
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">{plan.description}</p>
          </div>
          <Button variant="light" size="sm" onPress={() => patchUI({ dismissed: true })}>
            Dismiss
          </Button>
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--app-text-muted)]">
            <span>
              {completedCount}/{totalSteps} steps complete
            </span>
            <span>{Math.round(completionPercent)}%</span>
          </div>
          <Progress value={completionPercent} maxValue={100} className="h-2" aria-label="Onboarding progress" />
        </div>

        <TaskChecklist
          items={plan.steps.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            completed: completedStepSet.has(step.id),
            metaLabel: `${step.estimatedMinutes}m`,
          }))}
          onToggle={markStep}
          className="max-h-56 overflow-y-auto"
        />

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<Compass className="w-4 h-4" />}
            onPress={startNextStep}
          >
            Start Next Step
          </Button>
        </div>
      </Card>
    </div>
  );
}
