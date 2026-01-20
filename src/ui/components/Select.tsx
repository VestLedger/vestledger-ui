import { Select as NextUISelect, SelectItem as NextUISelectItem, SelectProps as NextUISelectProps } from '@nextui-org/react';
import { forwardRef } from 'react';

export const SelectItem = NextUISelectItem;

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<NextUISelectProps, 'children'> {
  options: SelectOption[];
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const {
    options,
    variant = 'bordered',
    size = 'md',
    classNames,
    ...rest
  } = props;

  return (
    <NextUISelect
      ref={ref}
      variant={variant}
      size={size}
      classNames={{
        trigger: 'bg-app-surface-hover dark:bg-app-dark-surface-hover border border-app-border-subtle dark:border-app-dark-border-subtle',
        ...classNames,
      }}
      {...rest}
    >
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </NextUISelect>
  );
});

Select.displayName = 'Select';
