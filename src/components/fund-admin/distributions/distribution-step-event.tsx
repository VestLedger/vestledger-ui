"use client";

import { Card, Input, Select, Textarea } from "@/ui";
import { SectionHeader } from "@/components/ui";
import type { Distribution, DistributionEventType } from "@/types/distribution";

const EVENT_TYPE_OPTIONS: Array<{ value: DistributionEventType; label: string }> = [
  { value: "exit", label: "Exit" },
  { value: "dividend", label: "Dividend" },
  { value: "recapitalization", label: "Recapitalization" },
  { value: "refinancing", label: "Refinancing" },
  { value: "partial-exit", label: "Partial Exit" },
  { value: "other", label: "Other" },
];

export interface DistributionStepEventProps {
  eventData: Partial<Distribution>;
  onChange: (patch: Partial<Distribution>) => void;
  errors?: Partial<{
    name: string;
    eventType: string;
    eventDate: string;
    grossProceeds: string;
  }>;
  showErrors?: boolean;
}

export function DistributionStepEvent({
  eventData,
  onChange,
  errors,
  showErrors = false,
}: DistributionStepEventProps) {
  const fieldErrors = showErrors ? errors ?? {} : {};
  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Distribution Event"
        description="Capture the core distribution details before calculating allocations."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Distribution name"
          value={eventData.name ?? ""}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Fund II Exit Distribution"
          isInvalid={Boolean(fieldErrors.name)}
          errorMessage={fieldErrors.name}
        />
        <Select
          label="Event type"
          selectedKeys={eventData.eventType ? [eventData.eventType] : []}
          onChange={(event) =>
            onChange({ eventType: event.target.value as DistributionEventType })
          }
          options={EVENT_TYPE_OPTIONS}
          placeholder="Select event type"
          isInvalid={Boolean(fieldErrors.eventType)}
          errorMessage={fieldErrors.eventType}
        />
        <Input
          label="Event date"
          type="date"
          value={eventData.eventDate ?? ""}
          onChange={(event) => onChange({ eventDate: event.target.value })}
          isInvalid={Boolean(fieldErrors.eventDate)}
          errorMessage={fieldErrors.eventDate}
        />
        <Input
          label="Payment date"
          type="date"
          value={eventData.paymentDate ?? ""}
          onChange={(event) => onChange({ paymentDate: event.target.value })}
        />
        <Input
          label="Gross proceeds"
          type="number"
          value={(eventData.grossProceeds ?? 0).toString()}
          onChange={(event) =>
            onChange({ grossProceeds: Number(event.target.value) || 0 })
          }
          isInvalid={Boolean(fieldErrors.grossProceeds)}
          errorMessage={fieldErrors.grossProceeds}
        />
        <Input
          label="Fund"
          value={eventData.fundName ?? "All Funds"}
          isReadOnly
        />
      </div>

      <Textarea
        label="Description"
        value={eventData.description ?? ""}
        onChange={(event) => onChange({ description: event.target.value })}
        minRows={3}
        placeholder="Notes about the distribution event..."
      />
    </Card>
  );
}
