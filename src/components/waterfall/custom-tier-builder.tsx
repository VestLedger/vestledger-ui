'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button, Card, Input, Modal, Select, Textarea } from '@/ui';
import { useUIKey } from '@/store/ui';
import { formatCurrencyCompact } from '@/utils/formatting';
import type { WaterfallScenario, WaterfallTier, WaterfallTemplate } from '@/types/waterfall';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

type TierDraft = {
  name: string;
  type: WaterfallTier['type'];
  threshold?: number;
  hurdleRate?: number;
  gpCarryPercentage?: number;
  lpPercentage?: number;
  splitType?: WaterfallTier['splitType'];
  description?: string;
};

type TierBuilderUIState = {
  selectedTemplateId: string;
};

const tierTypeOptions: Array<{ value: WaterfallTier['type']; label: string }> = [
  { value: 'roc', label: 'Return of Capital' },
  { value: 'preferred-return', label: 'Preferred Return' },
  { value: 'catch-up', label: 'GP Catch-Up' },
  { value: 'carry', label: 'Carry Split' },
];

const splitTypeOptions: Array<{ value: NonNullable<WaterfallTier['splitType']>; label: string }> = [
  { value: 'pro-rata', label: 'Pro-Rata' },
  { value: 'equal', label: 'Equal' },
  { value: 'custom', label: 'Custom' },
];

const getTypeLabel = (type: WaterfallTier['type']) =>
  tierTypeOptions.find((option) => option.value === type)?.label ?? type;

const getDefaultsForType = (type: WaterfallTier['type']): Partial<TierDraft> => {
  switch (type) {
    case 'preferred-return':
      return { hurdleRate: 8, lpPercentage: 100, gpCarryPercentage: 0, splitType: 'pro-rata' };
    case 'catch-up':
      return { gpCarryPercentage: 100, lpPercentage: 0 };
    case 'carry':
      return { gpCarryPercentage: 20, lpPercentage: 80, splitType: 'pro-rata' };
    case 'roc':
    default:
      return { gpCarryPercentage: 0, lpPercentage: 100, splitType: 'pro-rata' };
  }
};

const createDraft = (overrides?: Partial<TierDraft>): TierDraft => ({
  name: '',
  type: 'roc',
  threshold: undefined,
  hurdleRate: undefined,
  gpCarryPercentage: 0,
  lpPercentage: 100,
  splitType: 'pro-rata',
  description: '',
  ...overrides,
});

const formatPercent = (value?: number) =>
  typeof value === 'number' ? `${value.toFixed(1)}%` : '-';

function SortableTierCard({
  tier,
  onEdit,
  onDelete,
}: {
  tier: WaterfallTier;
  onEdit: (tier: WaterfallTier) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4 hover:border-[var(--app-border-strong)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 flex h-7 w-7 items-center justify-center rounded-md border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-border-strong)] cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{tier.name}</h4>
              <Badge size="sm" variant="flat">
                {getTypeLabel(tier.type)}
              </Badge>
            </div>
            {tier.description && (
              <div className="text-xs text-[var(--app-text-muted)] mt-1">
                {tier.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label={`Edit ${tier.name}`}
            onPress={() => onEdit(tier)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label={`Delete ${tier.name}`}
            onPress={() => onDelete(tier.id)}
          >
            <Trash2 className="h-4 w-4 text-[var(--app-danger)]" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <div className="text-[var(--app-text-muted)]">Threshold</div>
          <div className="font-medium">
            {tier.threshold ? formatCurrencyCompact(tier.threshold) : '-'}
          </div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Hurdle</div>
          <div className="font-medium">{formatPercent(tier.hurdleRate)}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">LP Split</div>
          <div className="font-medium">{formatPercent(tier.lpPercentage)}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">GP Carry</div>
          <div className="font-medium">{formatPercent(tier.gpCarryPercentage)}</div>
        </div>
      </div>
    </div>
  );
}

export interface CustomTierBuilderProps {
  scenario: WaterfallScenario;
  templates: WaterfallTemplate[];
  isLoading: boolean;
  error?: { message?: string } | null;
  onRetry?: () => void;
  onScenarioChange: (scenario: WaterfallScenario) => void;
}

export function CustomTierBuilder({
  scenario,
  templates,
  isLoading,
  error,
  onRetry,
  onScenarioChange,
}: CustomTierBuilderProps) {
  const { value: ui, patch: patchUI } = useUIKey<TierBuilderUIState>('waterfall-tier-builder', {
    selectedTemplateId: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TierDraft>(createDraft());

  const sortedTiers = useMemo(
    () => [...scenario.tiers].sort((a, b) => a.order - b.order),
    [scenario.tiers]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTiers.findIndex((item) => item.id === active.id);
    const newIndex = sortedTiers.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedTiers, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index,
    }));

    onScenarioChange({
      ...scenario,
      tiers: reordered,
      updatedAt: new Date().toISOString(),
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setDraft(createDraft());
    setIsModalOpen(true);
  };

  const openEditModal = (tier: WaterfallTier) => {
    setEditingId(tier.id);
    setDraft(
      createDraft({
        name: tier.name,
        type: tier.type,
        threshold: tier.threshold,
        hurdleRate: tier.hurdleRate,
        gpCarryPercentage: tier.gpCarryPercentage,
        lpPercentage: tier.lpPercentage,
        splitType: tier.splitType,
        description: tier.description,
      })
    );
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const nextTiers = sortedTiers.filter((tier) => tier.id !== id).map((tier, index) => ({
      ...tier,
      order: index,
    }));
    onScenarioChange({
      ...scenario,
      tiers: nextTiers,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;

    const updatedTiers = [...sortedTiers];
    if (editingId) {
      const index = updatedTiers.findIndex((tier) => tier.id === editingId);
      if (index !== -1) {
        updatedTiers[index] = {
          ...updatedTiers[index],
          ...draft,
          name: draft.name.trim(),
          isCustom: true,
        } as WaterfallTier;
      }
    } else {
      updatedTiers.push({
        id: `tier-${Date.now()}`,
        order: updatedTiers.length,
        name: draft.name.trim(),
        type: draft.type,
        threshold: draft.threshold,
        hurdleRate: draft.hurdleRate,
        gpCarryPercentage: draft.gpCarryPercentage,
        lpPercentage: draft.lpPercentage,
        splitType: draft.splitType,
        description: draft.description,
        isCustom: true,
      });
    }

    onScenarioChange({
      ...scenario,
      tiers: updatedTiers.map((tier, index) => ({ ...tier, order: index })),
      updatedAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleTypeChange = (type: WaterfallTier['type']) => {
    setDraft((current) => ({
      ...current,
      type,
      ...getDefaultsForType(type),
    }));
  };

  const selectedTemplate = templates.find((template) => template.id === ui.selectedTemplateId);

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    const now = Date.now();
    const nextTiers = selectedTemplate.tiers.map((tier, index) => ({
      ...tier,
      id: `tier-${now}-${index}`,
      order: index,
      isCustom: false,
    }));
    onScenarioChange({
      ...scenario,
      model: selectedTemplate.model,
      tiers: nextTiers,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Custom Tier Builder</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Configure and reorder waterfall tiers for bespoke carry structures.
          </p>
        </div>
        <Button
          size="sm"
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={openAddModal}
        >
          Add Tier
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          label="Tier Template"
          selectedKeys={ui.selectedTemplateId ? [ui.selectedTemplateId] : []}
          onChange={(event) => patchUI({ selectedTemplateId: event.target.value })}
          options={templates.map((template) => ({
            label: template.name,
            value: template.id,
          }))}
          placeholder={isLoading ? 'Loading templates...' : 'Choose template'}
        />
        <Button
          size="sm"
          variant="bordered"
          onPress={handleApplyTemplate}
          isDisabled={!selectedTemplate}
        >
          Apply Template
        </Button>
        {error && (
          <Button size="sm" variant="light" onPress={onRetry}>
            Retry templates
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sortedTiers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
            Add tiers to start customizing the waterfall.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={sortedTiers.map((tier) => tier.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sortedTiers.map((tier) => (
                  <SortableTierCard
                    key={tier.id}
                    tier={tier}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal
        title={editingId ? 'Edit Tier' : 'Add Tier'}
        isOpen={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              Save Tier
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <Input
            label="Tier name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
          <Select
            label="Tier type"
            selectedKeys={[draft.type]}
            onChange={(event) => handleTypeChange(event.target.value as WaterfallTier['type'])}
            options={tierTypeOptions}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Threshold"
              type="number"
              value={draft.threshold?.toString() ?? ''}
              onChange={(event) =>
                setDraft((current) => {
                  const value = Number(event.target.value);
                  return {
                    ...current,
                    threshold: Number.isNaN(value) ? undefined : value,
                  };
                })
              }
            />
            <Input
              label="Hurdle rate (%)"
              type="number"
              value={draft.hurdleRate?.toString() ?? ''}
              onChange={(event) =>
                setDraft((current) => {
                  const value = Number(event.target.value);
                  return {
                    ...current,
                    hurdleRate: Number.isNaN(value) ? undefined : value,
                  };
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="LP split (%)"
              type="number"
              value={draft.lpPercentage?.toString() ?? ''}
              onChange={(event) =>
                setDraft((current) => {
                  const value = Number(event.target.value);
                  return {
                    ...current,
                    lpPercentage: Number.isNaN(value) ? undefined : value,
                  };
                })
              }
            />
            <Input
              label="GP carry (%)"
              type="number"
              value={draft.gpCarryPercentage?.toString() ?? ''}
              onChange={(event) =>
                setDraft((current) => {
                  const value = Number(event.target.value);
                  return {
                    ...current,
                    gpCarryPercentage: Number.isNaN(value) ? undefined : value,
                  };
                })
              }
            />
          </div>
          <Select
            label="Split type"
            selectedKeys={draft.splitType ? [draft.splitType] : []}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                splitType: event.target.value as WaterfallTier['splitType'],
              }))
            }
            options={splitTypeOptions}
            placeholder="Select split type"
          />
          <Textarea
            label="Description"
            value={draft.description ?? ''}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            minRows={3}
          />
        </div>
      </Modal>
    </Card>
  );
}
