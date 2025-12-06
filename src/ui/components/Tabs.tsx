'use client';

import { Tabs as NextUITabs, TabsProps as NextUITabsProps, Tab as NextUITab } from '@nextui-org/react';
import { cn } from '@nextui-org/react';
import { ComponentProps } from 'react';

export interface TabsProps extends NextUITabsProps {}
export type TabProps = ComponentProps<typeof NextUITab>;

export const Tab = NextUITab;

export function Tabs({ classNames, ...props }: TabsProps) {
  const isSolid = !props.variant || props.variant === 'solid';

  return (
    <NextUITabs
      classNames={{
        base: cn("px-4 sm:px-6 lg:px-8", classNames?.base),
        tabList: cn("gap-4 border-b border-[var(--app-border)]", classNames?.tabList),
        cursor: cn("bg-[var(--tab-cursor)]", classNames?.cursor),
        tab: cn("px-4 py-3", classNames?.tab),
        tabContent: cn(
          "text-[var(--app-text-muted)]",
          isSolid 
            ? "group-data-[selected=true]:text-[var(--tab-selected-text-solid)]"
            : "group-data-[selected=true]:text-[var(--tab-selected-text-underlined)]",
          classNames?.tabContent
        ),
        ...classNames,
      }}
      {...props}
    />
  );
}
