'use client';

import { Button } from '@nextui-org/react';
import { forwardRef, ReactNode } from 'react';

export interface FloatingActionButtonProps {
  /** Icon to display (required for FAB) */
  icon: ReactNode;
  /** Optional label text (for extended FAB) */
  label?: ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Button color */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** FAB size */
  size?: 'sm' | 'md' | 'lg';
  /** Position on the screen */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  /** Whether the FAB is disabled */
  isDisabled?: boolean;
  /** Whether the FAB is in loading state */
  isLoading?: boolean;
  /** Whether the FAB should be extended (show label) */
  isExtended?: boolean;
  /** Accessible label (required) */
  'aria-label': string;
  /** Additional class name */
  className?: string;
  /** Z-index for stacking */
  zIndex?: number;
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const sizeClasses = {
  sm: 'min-w-[48px] h-12 text-sm',
  md: 'min-w-[56px] h-14 text-base',
  lg: 'min-w-[64px] h-16 text-lg',
};

const iconSizeClasses = {
  sm: '[&_svg]:w-5 [&_svg]:h-5',
  md: '[&_svg]:w-6 [&_svg]:h-6',
  lg: '[&_svg]:w-7 [&_svg]:h-7',
};

/**
 * FloatingActionButton (FAB) - A prominent circular button for the primary action
 *
 * Use for:
 * - Primary screen action (e.g., "Compose", "Add new")
 * - Actions that should be always visible and accessible
 * - Mobile-first designs where the main action needs to be thumb-accessible
 *
 * Guidelines:
 * - Use only ONE FAB per screen
 * - Reserve for the most important, constructive action
 * - Don't use for destructive actions
 *
 * @example
 * ```tsx
 * // Standard FAB
 * <FloatingActionButton
 *   icon={<PlusIcon />}
 *   aria-label="Create new item"
 *   onPress={() => setIsCreateModalOpen(true)}
 * />
 *
 * // Extended FAB with label
 * <FloatingActionButton
 *   icon={<PlusIcon />}
 *   label="New Distribution"
 *   isExtended
 *   aria-label="Create new distribution"
 *   onPress={() => router.push('/distributions/new')}
 * />
 *
 * // Custom position
 * <FloatingActionButton
 *   icon={<EditIcon />}
 *   position="bottom-left"
 *   aria-label="Edit"
 *   onPress={handleEdit}
 * />
 * ```
 */
export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  (
    {
      icon,
      label,
      onPress,
      color = 'primary',
      size = 'md',
      position = 'bottom-right',
      isDisabled = false,
      isLoading = false,
      isExtended = false,
      'aria-label': ariaLabel,
      className = '',
      zIndex = 50,
    },
    ref
  ) => {
    const showLabel = isExtended && label;

    return (
      <Button
        ref={ref}
        isIconOnly={!showLabel}
        variant="solid"
        color={color}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onPress={onPress}
        aria-label={ariaLabel}
        className={`
          fixed ${positionClasses[position]}
          ${sizeClasses[size]}
          ${iconSizeClasses[size]}
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-200
          hover:scale-105 active:scale-95
          ${showLabel ? 'px-6 gap-2' : ''}
          ${className}
        `}
        style={{ zIndex }}
        startContent={showLabel ? icon : undefined}
      >
        {showLabel ? label : icon}
      </Button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

// Alias for shorter import
export { FloatingActionButton as FAB };
