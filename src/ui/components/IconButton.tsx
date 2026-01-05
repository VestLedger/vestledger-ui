import { Button, ButtonProps } from '@nextui-org/react';
import { forwardRef, ReactNode } from 'react';

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
    radius = 'sm',
    ...rest
  } = props;

  return (
    <Button
      ref={ref}
      isIconOnly
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      {...rest}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';
