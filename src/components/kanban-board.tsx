'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Badge } from '@/ui';
import { useUIKey } from '@/store/ui';

interface KanbanItem {
  id: UniqueIdentifier;
  [key: string]: any;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  stateKey?: string;
  columns: KanbanColumn[];
  onItemMove: (itemId: UniqueIdentifier, newStage: string) => void;
  renderItem: (item: KanbanItem) => React.ReactNode;
}

function SortableItem({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}

export function KanbanBoard({ stateKey = 'default', columns, onItemMove, renderItem }: KanbanBoardProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    activeId: UniqueIdentifier | null;
  }>(`kanban-board:${stateKey}`, {
    activeId: null,
  });
  const { activeId } = ui;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    patchUI({ activeId: event.active.id });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = columns.find((col) =>
      col.items.some((item) => item.id === active.id)
    );
    const overColumn = columns.find(
      (col) => col.id === over.id || col.items.some((item) => item.id === over.id)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    // Item moved to different column
    onItemMove(active.id, overColumn.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    patchUI({ activeId: null });
  };

  const activeItem = columns
    .flatMap((col) => col.items)
    .find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72 sm:w-80">
            <Card className="mb-3" padding="sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <Badge
                  size="sm"
                  variant="flat"
                  className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]"
                >
                  {column.items.length}
                </Badge>
              </div>
            </Card>

            <SortableContext
              items={column.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="space-y-3 min-h-[100px] p-2 rounded-lg transition-colors"
                data-column-id={column.id}
              >
                {column.items.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[var(--app-text-muted)]">
                    No items
                  </div>
                ) : (
                  column.items.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      {renderItem(item)}
                    </SortableItem>
                  ))
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId && activeItem ? (
          <div className="opacity-90 rotate-2 scale-105">
            {renderItem(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
