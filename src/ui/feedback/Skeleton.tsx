import { Skeleton as NextUISkeleton, SkeletonProps as NextUISkeletonProps } from '@nextui-org/react';

export interface SkeletonProps extends NextUISkeletonProps {
  className?: string;
}

export function Skeleton({ className = '', ...rest }: SkeletonProps) {
  return (
    <NextUISkeleton
      className={`rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover ${className}`}
      {...rest}
    />
  );
}
