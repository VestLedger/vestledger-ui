import { Card as NextUICard, CardBody, CardHeader, CardFooter, CardProps as NextUICardProps } from '@nextui-org/react';
import { ReactNode } from 'react';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

export interface CardProps extends Omit<NextUICardProps, 'children'> {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, header, footer, padding = 'md', className = '', ...rest }: CardProps) {
  const density = useDashboardDensity();
  const paddingClasses = density.cardPadding;

  const cardClass = `bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-lg ${className}`;

  return (
    <NextUICard className={cardClass} {...rest}>
      {header && <CardHeader className={paddingClasses[padding]}>{header}</CardHeader>}
      <CardBody className={paddingClasses[padding]}>{children}</CardBody>
      {footer && <CardFooter className={paddingClasses[padding]}>{footer}</CardFooter>}
    </NextUICard>
  );
}
