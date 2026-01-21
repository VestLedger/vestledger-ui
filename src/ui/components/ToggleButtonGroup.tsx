'use client';

import { Button } from '@nextui-org/react';
import { ReactNode, Key, useCallback, useMemo } from 'react';

export interface ToggleButtonOption {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  isDisabled?: boolean;
  'aria-label'?: string;
}

export interface ToggleButtonGroupProps {
  /** Available options */
  options: ToggleButtonOption[];
  /** Currently selected key(s) */
  selectedKeys: Set<Key> | Key;
  /** Called when selection changes */
  onSelectionChange: (keys: Set<Key>) => void;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Button variant for unselected state */
  variant?: 'bordered' | 'light' | 'flat';
  /** Color for selected state */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the entire group is disabled */
  isDisabled?: boolean;
  /** Whether buttons should take full width */
  fullWidth?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Accessible label for the group */
  'aria-label': string;
}

/**
 * ToggleButtonGroup - A group of buttons where one or more can be selected
 *
 * Use for:
 * - View switchers (Grid/List/Table)
 * - Filter toggles
 * - Mode selection
 * - Any mutually exclusive or multi-select button choices
 *
 * @example
 * ```tsx
 * // Single selection (view switcher)
 * const [view, setView] = useState<Set<Key>>(new Set(['grid']));
 *
 * <ToggleButtonGroup
 *   aria-label="View mode"
 *   options={[
 *     { key: 'grid', label: 'Grid', icon: <GridIcon /> },
 *     { key: 'list', label: 'List', icon: <ListIcon /> },
 *   ]}
 *   selectedKeys={view}
 *   onSelectionChange={setView}
 *   selectionMode="single"
 * />
 *
 * // Multiple selection (filters)
 * <ToggleButtonGroup
 *   aria-label="Status filters"
 *   options={[
 *     { key: 'active', label: 'Active' },
 *     { key: 'pending', label: 'Pending' },
 *     { key: 'closed', label: 'Closed' },
 *   ]}
 *   selectedKeys={selectedStatuses}
 *   onSelectionChange={setSelectedStatuses}
 *   selectionMode="multiple"
 * />
 * ```
 */
export function ToggleButtonGroup({
  options,
  selectedKeys,
  onSelectionChange,
  selectionMode = 'single',
  variant = 'bordered',
  color = 'primary',
  size = 'md',
  isDisabled = false,
  fullWidth = false,
  className = '',
  'aria-label': ariaLabel,
}: ToggleButtonGroupProps) {
  // Normalize selectedKeys to Set
  const selectedSet = useMemo(
    () => (selectedKeys instanceof Set ? selectedKeys : new Set([selectedKeys])),
    [selectedKeys]
  );

  const handleToggle = useCallback(
    (key: string) => {
      const newSelection = new Set(selectedSet);

      if (selectionMode === 'single') {
        // Single selection: replace selection
        newSelection.clear();
        newSelection.add(key);
      } else {
        // Multiple selection: toggle
        if (newSelection.has(key)) {
          newSelection.delete(key);
        } else {
          newSelection.add(key);
        }
      }

      onSelectionChange(newSelection);
    },
    [selectedSet, selectionMode, onSelectionChange]
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex rounded-lg border border-app-border dark:border-app-dark-border p-1 gap-1 bg-app-surface dark:bg-app-dark-surface ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {options.map((option, index) => {
        const isSelected = selectedSet.has(option.key);
        const isOptionDisabled = isDisabled || option.isDisabled;

        return (
          <Button
            key={option.key}
            variant={isSelected ? 'solid' : variant}
            color={isSelected ? color : 'default'}
            size={size}
            isDisabled={isOptionDisabled}
            onPress={() => handleToggle(option.key)}
            aria-pressed={isSelected}
            aria-label={option['aria-label']}
            className={`
              ${fullWidth ? 'flex-1' : ''}
              ${!isSelected ? 'bg-transparent' : ''}
              ${index === 0 ? 'rounded-l-md' : ''}
              ${index === options.length - 1 ? 'rounded-r-md' : ''}
              min-w-[44px]
            `}
            startContent={option.icon}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
