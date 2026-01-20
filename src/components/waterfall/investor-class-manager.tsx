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
import { Badge, Button, Card, Input, Modal, Progress, Select } from '@/ui';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { InvestorClass } from '@/types/waterfall';
import { formatCurrencyCompact } from '@/utils/formatting';

const CLASS_COLORS = [
  'var(--app-primary)',
  'var(--app-secondary)',
  'var(--app-accent)',
  'var(--app-info)',
  'var(--app-success)',
  'var(--app-warning)',
];

type InvestorClassDraft = {
  name: string;
  type: InvestorClass['type'];
  ownershipPercentage: number;
  commitment: number;
  capitalCalled: number;
  capitalReturned: number;
  notes?: string;
};

const createDraft = (overrides?: Partial<InvestorClassDraft>): InvestorClassDraft => ({
  name: '',
  type: 'lp',
  ownershipPercentage: 0,
  commitment: 0,
  capitalCalled: 0,
  capitalReturned: 0,
  ...overrides,
});

const getTypeLabel = (type: InvestorClass['type']) => (type === 'gp' ? 'GP' : 'LP');

const getOwnershipStatus = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 100) {
    return { label: 'Over-allocated', color: 'danger' as const };
  }
  if (rounded < 100) {
    return { label: 'Under-allocated', color: 'warning' as const };
  }
  return { label: 'Balanced', color: 'success' as const };
};

function SortableInvestorClassCard({
  investorClass,
  color,
  onEdit,
  onDelete,
}: {
  investorClass: InvestorClass;
  color: string;
  onEdit: (value: InvestorClass) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: investorClass.id });

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
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <h4 className="font-medium">{investorClass.name}</h4>
            </div>
            <Badge size="sm" variant="flat" className="mt-1">
              {getTypeLabel(investorClass.type)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label={`Edit ${investorClass.name}`}
            onPress={() => onEdit(investorClass)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            aria-label={`Delete ${investorClass.name}`}
            onPress={() => onDelete(investorClass.id)}
          >
            <Trash2 className="h-4 w-4 text-[var(--app-danger)]" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <div className="text-[var(--app-text-muted)]">Commitment</div>
          <div className="font-medium">{formatCurrencyCompact(investorClass.commitment)}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Ownership</div>
          <div className="font-medium">{investorClass.ownershipPercentage.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Called</div>
          <div className="font-medium">{formatCurrencyCompact(investorClass.capitalCalled)}</div>
        </div>
        <div>
          <div className="text-[var(--app-text-muted)]">Returned</div>
          <div className="font-medium">{formatCurrencyCompact(investorClass.capitalReturned)}</div>
        </div>
      </div>
    </div>
  );
}

export interface InvestorClassManagerProps {
  classes: InvestorClass[];
  onChange: (classes: InvestorClass[]) => void;
}

export function InvestorClassManager({ classes, onChange }: InvestorClassManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<InvestorClassDraft>(createDraft());

  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => a.order - b.order),
    [classes]
  );

  const totalOwnership = sortedClasses.reduce((sum, ic) => sum + ic.ownershipPercentage, 0);
  const totalCommitment = sortedClasses.reduce((sum, ic) => sum + ic.commitment, 0);
  const ownershipStatus = getOwnershipStatus(totalOwnership);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedClasses.findIndex((item) => item.id === active.id);
    const newIndex = sortedClasses.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedClasses, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index,
      updatedAt: new Date().toISOString(),
    }));
    onChange(reordered);
  };

  const openAddModal = () => {
    setEditingId(null);
    setDraft(createDraft());
    setIsModalOpen(true);
  };

  const openEditModal = (investorClass: InvestorClass) => {
    setEditingId(investorClass.id);
    setDraft(
      createDraft({
        name: investorClass.name,
        type: investorClass.type,
        ownershipPercentage: investorClass.ownershipPercentage,
        commitment: investorClass.commitment,
        capitalCalled: investorClass.capitalCalled,
        capitalReturned: investorClass.capitalReturned,
        notes: investorClass.notes,
      })
    );
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const next = classes
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        order: index,
        updatedAt: new Date().toISOString(),
      }));
    onChange(next);
  };

  const handleSave = () => {
    const trimmedName = draft.name.trim();
    if (!trimmedName) return;

    const now = new Date().toISOString();

    if (editingId) {
      const next = classes.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: trimmedName,
              type: draft.type,
              ownershipPercentage: draft.ownershipPercentage,
              commitment: draft.commitment,
              capitalCalled: draft.capitalCalled,
              capitalReturned: draft.capitalReturned,
              notes: draft.notes,
              updatedAt: now,
            }
          : item
      );
      onChange(next);
    } else {
      const newClass: InvestorClass = {
        id: `ic-${Date.now()}`,
        name: trimmedName,
        type: draft.type,
        ownershipPercentage: draft.ownershipPercentage,
        commitment: draft.commitment,
        capitalCalled: draft.capitalCalled,
        capitalReturned: draft.capitalReturned,
        notes: draft.notes,
        order: classes.length,
        createdAt: now,
        updatedAt: now,
      };
      onChange([...classes, newClass]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Investor Classes</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Reorder classes to control display order. Ownership is informational only.
          </p>
        </div>
        <Button color="primary" onPress={openAddModal} startContent={<Plus className="h-4 w-4" />}>
          Add Class
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-[var(--app-text-muted)]">Total Ownership</div>
            <div className="text-lg font-semibold">{totalOwnership.toFixed(1)}%</div>
          </div>
          <Badge color={ownershipStatus.color} variant="flat">
            {ownershipStatus.label}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-[var(--app-text-muted)]">Total Commitment</div>
            <div className="font-semibold">{formatCurrencyCompact(totalCommitment)}</div>
          </div>
        </div>
        <Progress
          value={Math.min(totalOwnership, 100)}
          maxValue={100}
          className="mt-3 h-2"
        />
      </div>

      <div className="mt-4">
        {sortedClasses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
            Add investor classes to start modeling the waterfall.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedClasses.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedClasses.map((investorClass, index) => (
                  <SortableInvestorClassCard
                    key={investorClass.id}
                    investorClass={investorClass}
                    color={CLASS_COLORS[index % CLASS_COLORS.length]}
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
        title={editingId ? 'Edit Investor Class' : 'Add Investor Class'}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave} isDisabled={!draft.name.trim()}>
              {editingId ? 'Save Changes' : 'Add Class'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Class Name"
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Class A LPs"
          />
          <Select
            label="Type"
            options={[
              { value: 'lp', label: 'LP' },
              { value: 'gp', label: 'GP' },
            ]}
            selectedKeys={[draft.type]}
            onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as InvestorClass['type'] }))}
            disallowEmptySelection
          />
          <Input
            label="Ownership %"
            type="number"
            value={draft.ownershipPercentage.toString()}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, ownershipPercentage: Number(event.target.value) || 0 }))
            }
          />
          <Input
            label="Commitment"
            type="number"
            value={draft.commitment.toString()}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, commitment: Number(event.target.value) || 0 }))
            }
          />
          <Input
            label="Capital Called"
            type="number"
            value={draft.capitalCalled.toString()}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, capitalCalled: Number(event.target.value) || 0 }))
            }
          />
          <Input
            label="Capital Returned"
            type="number"
            value={draft.capitalReturned.toString()}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, capitalReturned: Number(event.target.value) || 0 }))
            }
          />
        </div>
      </Modal>
    </Card>
  );
}
