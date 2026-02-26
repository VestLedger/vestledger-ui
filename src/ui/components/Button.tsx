'use client';

import { Button as NextUIButton, ButtonProps as NextUIButtonProps } from '@nextui-org/react';
import { forwardRef, isValidElement } from 'react';
import { createUnavailableActionError } from '@/services/shared/unavailableAction';

export interface ButtonProps extends NextUIButtonProps {
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

function describeButtonChildren(children: ButtonProps['children']): string {
  if (typeof children === 'string') {
    return children.trim() || 'button';
  }

  if (Array.isArray(children)) {
    const firstText = children.find((entry) => typeof entry === 'string');
    if (typeof firstText === 'string') {
      return firstText.trim() || 'button';
    }
  }

  if (isValidElement<{ children?: unknown }>(children) && typeof children.props?.children === 'string') {
    return children.props.children.trim() || 'button';
  }

  return 'button';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant = 'solid', color = 'primary', size = 'md', ...rest } = props;
  const hasHandler = typeof rest.onPress === 'function' || typeof rest.onClick === 'function';
  const hasHref = typeof (rest as { href?: unknown }).href === 'string';
  const type = (rest as { type?: string }).type;
  const disabled = Boolean((rest as { isDisabled?: boolean; disabled?: boolean }).isDisabled || (rest as { disabled?: boolean }).disabled);
  const shouldGuardAsTodo =
    !hasHandler
    && !hasHref
    && !disabled
    && type !== 'submit'
    && type !== 'reset';

  const guardedOnPress = shouldGuardAsTodo
    ? () => {
        const label = describeButtonChildren(props.children);
        createUnavailableActionError(`button:${label.toLowerCase().replace(/\\s+/g, '-')}`, {
          source: 'ui.components.Button',
          uiLocation: label,
          route: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
      }
    : rest.onPress;

  return (
    <NextUIButton
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      {...rest}
      onPress={guardedOnPress}
    />
  );
});

Button.displayName = 'Button';
