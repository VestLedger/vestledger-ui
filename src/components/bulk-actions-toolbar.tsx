'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/ui';
import { X, Check, Trash2, Tag, Archive, Mail, Download, MoreHorizontal } from 'lucide-react';
import { useUIKey } from '@/store/ui';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  onClick: () => void;
}

export interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClear: () => void;
  onSelectAll?: () => void;
  actions?: BulkAction[];
  customActions?: React.ReactNode;
}

const defaultActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'danger',
    onClick: () => console.log('Delete selected'),
  },
  {
    id: 'tag',
    label: 'Add Tag',
    icon: <Tag className="w-4 h-4" />,
    onClick: () => console.log('Add tag'),
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4" />,
    onClick: () => console.log('Archive selected'),
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Download className="w-4 h-4" />,
    onClick: () => console.log('Export selected'),
  },
];

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onClear,
  onSelectAll,
  actions = defaultActions,
  customActions,
}: BulkActionsToolbarProps) {
  const isVisible = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-30 bg-[var(--app-primary-bg)] border border-[var(--app-primary)] rounded-lg p-4 mb-4 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side - Selection info */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={onClear}
                className="bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Badge
                  size="lg"
                  variant="solid"
                  className="bg-[var(--app-primary)] text-white font-semibold"
                >
                  {selectedCount}
                </Badge>
                <span className="text-sm font-medium text-[var(--app-primary)]">
                  {selectedCount === 1 ? 'item selected' : 'items selected'}
                </span>
              </div>

              {onSelectAll && !isAllSelected && (
                <>
                  <span className="text-sm text-[var(--app-primary)]/70">•</span>
                  <button
                    onClick={onSelectAll}
                    className="text-sm font-medium text-[var(--app-primary)] hover:underline"
                  >
                    Select all {totalCount}
                  </button>
                </>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {actions.map((action) => {
                const buttonVariant =
                  action.variant === 'danger' ? 'flat' :
                  action.variant === 'success' ? 'flat' :
                  action.variant === 'warning' ? 'flat' :
                  'flat';

                const buttonColor =
                  action.variant === 'danger' ? 'danger' as const :
                  action.variant === 'success' ? 'success' as const :
                  action.variant === 'warning' ? 'warning' as const :
                  'default' as const;

                return (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={buttonVariant}
                    color={buttonColor}
                    startContent={action.icon}
                    onPress={action.onClick}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    {action.label}
                  </Button>
                );
              })}

              {customActions}

              {/* More actions dropdown placeholder */}
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                className="bg-white/10 hover:bg-white/20"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string | number }>(items: T[], stateKey: string) {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedIds: Array<string | number>;
  }>(`bulk-selection:${stateKey}`, {
    selectedIds: [],
  });

  const selectedIdSet = useMemo(() => new Set(ui.selectedIds), [ui.selectedIds]);

  const toggleSelection = (id: string | number) => {
    patchUI({
      selectedIds: selectedIdSet.has(id)
        ? ui.selectedIds.filter((selectedId) => selectedId !== id)
        : [...ui.selectedIds, id],
    });
  };

  const selectAll = () => {
    patchUI({ selectedIds: items.map((item) => item.id) });
  };

  const clearSelection = () => {
    patchUI({ selectedIds: [] });
  };

  const isSelected = (id: string | number) => selectedIdSet.has(id);

  const selectedItems = items.filter((item) => selectedIdSet.has(item.id));

  return {
    selectedIds: selectedIdSet,
    selectedCount: selectedIdSet.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    selectedItems,
  };
}
