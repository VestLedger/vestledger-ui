import { Button as NextUIButton, ButtonProps as NextUIButtonProps } from '@nextui-org/react';
import { forwardRef } from 'react';

export interface ButtonProps extends NextUIButtonProps {
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant = 'solid', color = 'primary', size = 'md', radius = 'sm', ...rest } = props;

  return (
    <NextUIButton
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      {...rest}
    />
  );
});

Button.displayName = 'Button';
