import { Slider as NextUISlider, type SliderProps as NextUISliderProps } from '@nextui-org/react';

export type SliderProps = NextUISliderProps;

export function Slider(props: SliderProps) {
  const {
    size = 'md',
    color = 'primary',
    ...rest
  } = props;

  return (
    <NextUISlider
      size={size}
      color={color}
      {...rest}
    />
  );
}
