"use client";

import { useState } from "react";
import { Badge, Button, Card, Checkbox, Input, Switch } from "@/ui";
import type { LPNotificationPreferences } from "@/data/mocks/lp-portal/lp-investor-portal";
import { SectionHeader } from "@/ui/composites";

export interface DistributionPreferencesProps {
  preferences: LPNotificationPreferences;
}

export function DistributionPreferences({ preferences }: DistributionPreferencesProps) {
  const [prefs, setPrefs] = useState(preferences);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: number) => {
    const exists = prefs.reminderDaysBefore.includes(day);
    const next = exists
      ? prefs.reminderDaysBefore.filter((value) => value !== day)
      : [...prefs.reminderDaysBefore, day];
    setPrefs({
      ...prefs,
      reminderDaysBefore: next.sort((a, b) => b - a),
    });
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <Card padding="lg">
      <SectionHeader
        title="Notification Preferences"
        description="Control distribution alerts and statement notifications."
        action={<Badge size="sm" variant="flat">Email only</Badge>}
      />

      <div className="mt-4 space-y-4">
        <Input
          label="Notification email"
          value={prefs.emailAddress}
          onChange={(event) => setPrefs({ ...prefs, emailAddress: event.target.value })}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Switch
            isSelected={prefs.statementReady}
            onValueChange={(value) => setPrefs({ ...prefs, statementReady: value })}
          >
            Statement ready alerts
          </Switch>
          <Switch
            isSelected={prefs.distributionReminders}
            onValueChange={(value) => setPrefs({ ...prefs, distributionReminders: value })}
          >
            Distribution reminders
          </Switch>
          <Switch
            isSelected={prefs.taxDocumentAlerts}
            onValueChange={(value) => setPrefs({ ...prefs, taxDocumentAlerts: value })}
          >
            Tax document alerts
          </Switch>
          <Switch
            isSelected={prefs.marketingUpdates}
            onValueChange={(value) => setPrefs({ ...prefs, marketingUpdates: value })}
          >
            Quarterly updates
          </Switch>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--app-text-muted)]">
            Reminder timing
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Checkbox
              isSelected={prefs.reminderDaysBefore.includes(7)}
              onValueChange={() => toggleDay(7)}
            >
              7 days before
            </Checkbox>
            <Checkbox
              isSelected={prefs.reminderDaysBefore.includes(1)}
              onValueChange={() => toggleDay(1)}
            >
              1 day before
            </Checkbox>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-[var(--app-text-muted)]">
          Preferences apply to upcoming distributions.
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-[var(--app-success)]">Saved</span>}
          <Button color="primary" onPress={handleSave}>
            Save preferences
          </Button>
        </div>
      </div>
    </Card>
  );
}
