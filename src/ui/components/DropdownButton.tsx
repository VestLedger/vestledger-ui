'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import type { DropdownProps, Selection } from '@nextui-org/react';
import { forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Key = string | number;

export interface DropdownButtonItem {
  key: string;
  label: string;
  description?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  isDisabled?: boolean;
  isDivider?: boolean;
}

export interface DropdownButtonProps {
  /** Button label text */
  label: ReactNode;
  /** Menu items */
  items: DropdownButtonItem[];
  /** Called when an item is selected */
  onAction?: (key: Key) => void;
  /** Button variant */
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  /** Button color */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to show before the label */
  startContent?: ReactNode;
  /** Whether to show the dropdown chevron */
  showChevron?: boolean;
  /** Whether the button is disabled */
  isDisabled?: boolean;
  /** Whether the button is in loading state */
  isLoading?: boolean;
  /** Menu placement */
  placement?: DropdownProps['placement'];
  /** Selection mode for the menu */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** Currently selected keys (for controlled selection) */
  selectedKeys?: Selection;
  /** Called when selection changes */
  onSelectionChange?: (keys: Selection) => void;
  /** Accessible label for the dropdown */
  'aria-label'?: string;
  /** Additional class name for the button */
  className?: string;
}

/**
 * DropdownButton - A button that opens a dropdown menu of actions
 *
 * Use for:
 * - "More options" menus
 * - Export/download format selection
 * - Bulk action menus
 * - Sort/filter options
 *
 * @example
 * ```tsx
 * <DropdownButton
 *   label="Export"
 *   items={[
 *     { key: 'csv', label: 'Export as CSV' },
 *     { key: 'pdf', label: 'Export as PDF' },
 *     { key: 'xlsx', label: 'Export as Excel' },
 *   ]}
 *   onAction={(key) => handleExport(key)}
 * />
 * ```
 */
export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(
  (
    {
      label,
      items,
      onAction,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      startContent,
      showChevron = true,
      isDisabled = false,
      isLoading = false,
      placement = 'bottom-start',
      selectionMode = 'none',
      selectedKeys,
      onSelectionChange,
      'aria-label': ariaLabel,
      className,
    },
    ref
  ) => {
    const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
      <Dropdown placement={placement}>
        <DropdownTrigger>
          <Button
            ref={ref}
            variant={variant}
            color={color}
            size={size}
            isDisabled={isDisabled}
            isLoading={isLoading}
            startContent={startContent}
            endContent={
              showChevron && !isLoading ? (
                <ChevronDown size={chevronSize} className="opacity-70" />
              ) : undefined
            }
            className={className}
            aria-label={ariaLabel}
          >
            {label}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={ariaLabel || `${label} menu`}
          onAction={onAction}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          items={items}
        >
          {(item) => (
            <DropdownItem
              key={item.key}
              description={item.description}
              startContent={item.startContent}
              endContent={item.endContent}
              color={item.color}
              isDisabled={item.isDisabled}
              showDivider={item.isDivider}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    );
  }
);

DropdownButton.displayName = 'DropdownButton';
