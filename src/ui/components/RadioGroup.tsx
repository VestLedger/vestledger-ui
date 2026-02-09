import {
  Radio as NextUIRadio,
  RadioGroup as NextUIRadioGroup,
  type RadioGroupProps as NextUIRadioGroupProps,
  type RadioProps as NextUIRadioProps,
} from '@nextui-org/react';
import { forwardRef, type ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: ReactNode;
  isDisabled?: boolean;
}

export interface RadioProps extends NextUIRadioProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface RadioGroupProps extends Omit<NextUIRadioGroupProps, 'children'> {
  options?: RadioOption[];
  children?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  const {
    size = 'md',
    color = 'primary',
    ...rest
  } = props;

  return (
    <NextUIRadio
      ref={ref}
      size={size}
      color={color}
      {...rest}
    />
  );
});

Radio.displayName = 'Radio';

export function RadioGroup({ options, classNames, children, ...props }: RadioGroupProps) {
  return (
    <NextUIRadioGroup
      classNames={{
        wrapper: 'gap-3',
        ...classNames,
      }}
      {...props}
    >
      {options
        ? options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              isDisabled={option.isDisabled}
            >
              {option.label}
            </Radio>
          ))
        : children}
    </NextUIRadioGroup>
  );
}

