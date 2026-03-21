import { forwardRef, ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {
    icon,
    variant = 'light',
    color = 'default',
    size = 'md',
    ...rest
  } = props;

  return (
    <Button
      ref={ref}
      isIconOnly
      variant={variant}
      color={color}
      size={size}
      {...rest}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';
