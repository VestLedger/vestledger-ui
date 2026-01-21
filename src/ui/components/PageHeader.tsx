'use client'

import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Badge, Tabs, Tab } from './';
import type { BadgeProps } from './';

export interface PageHeaderTab {
  id: string;
  label: string;
  count?: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface PageHeaderBadge {
  id?: string;
  label: ReactNode;
  variant?: BadgeProps['variant'];
  color?: BadgeProps['color'];
  size?: BadgeProps['size'];
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  aiSummary?: {
    text: string;
    confidence: number;
  };
  actionContent?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    aiSuggested?: boolean;
    confidence?: number;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  tabs?: PageHeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  badges?: PageHeaderBadge[];
  badgeContainerClassName?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  aiSummary,
  actionContent,
  primaryAction,
  secondaryActions,
  tabs,
  activeTab,
  onTabChange,
  badges,
  badgeContainerClassName,
  children,
}: PageHeaderProps) {
  const getTabPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="mb-8">
      {/* Title Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          {Icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-app-primary/10 to-app-accent/5 dark:from-app-dark-primary/10 dark:to-app-dark-accent/5 border border-app-primary/20 dark:border-app-dark-primary/20">
              <Icon className="w-6 h-6 text-app-primary dark:text-app-dark-primary" />
            </div>
          )}

          {/* Title & Description */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-app-text dark:text-app-dark-text">
                {title}
              </h1>

              {/* AI Summary Icon */}
              {aiSummary && (
                <div className="relative inline-block group">
                  <button className="p-1.5 rounded-lg bg-app-primary/10 dark:bg-app-dark-primary/10 hover:bg-app-primary/20 dark:hover:bg-app-dark-primary/20 transition-colors" aria-label="AI Summary">
                    <Sparkles className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                  </button>

                  {/* AI Summary Tooltip */}
                  <div className="absolute top-full left-0 mt-2 z-20 opacity-0 translate-y-[5px] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-150">
                    <div className="bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-lg shadow-xl p-4 min-w-[320px] max-w-[400px]">
                      <div className="flex items-start gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-app-primary dark:text-app-dark-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-app-text dark:text-app-dark-text mb-1">AI Page Summary</p>
                          <p className="text-sm text-app-text-muted dark:text-app-dark-text-muted leading-relaxed">{aiSummary.text}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">Confidence:</span>
                        <div className="flex-1 h-1.5 bg-app-surface-hover dark:bg-app-dark-surface-hover rounded-full overflow-hidden">
                          <div
                            className="h-full bg-app-primary dark:bg-app-dark-primary rounded-full"
                            style={{ width: `${aiSummary.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-app-primary dark:text-app-dark-primary">
                          {Math.round(aiSummary.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {description && (
              <p className="text-app-text-muted dark:text-app-dark-text-muted text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {(actionContent || primaryAction || secondaryActions) && (
          <div className="flex items-center gap-3">
            {actionContent}

            {!actionContent && secondaryActions?.map((action, index) => (
              <Button
                key={index}
                variant="bordered"
                onPress={action.onClick}
              >
                {action.label}
              </Button>
            ))}

            {!actionContent && primaryAction && (
              <div className="relative">
                <Button
                  onPress={primaryAction.onClick}
                  className={primaryAction.aiSuggested ? 'relative' : ''}
                >
                  {primaryAction.label}
                  {primaryAction.aiSuggested && (
                    <Sparkles className="w-4 h-4 ml-2" />
                  )}
                </Button>

                {primaryAction.aiSuggested && primaryAction.confidence && (
                  <div className="absolute -top-2 -right-2">
                    <div className="px-1.5 py-0.5 rounded-full bg-app-primary dark:bg-app-dark-primary text-white text-xs font-bold shadow-lg">
                      {Math.round(primaryAction.confidence * 100)}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div
          className={[
            'flex flex-wrap items-center gap-3 mt-4',
            badgeContainerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {badges.map((badge, index) => (
            <Badge
              key={badge.id ?? index}
              variant={badge.variant}
              color={badge.color}
              size={badge.size}
              className={badge.className}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="w-full">
          <Tabs
            variant="underlined"
            aria-label="Page Sections"
            selectedKey={activeTab}
            onSelectionChange={(key) => onTabChange?.(key as string)}
            classNames={{
              base: "w-full p-0",
              tabList: "w-full relative rounded-none p-0 border-b border-app-border dark:border-app-dark-border gap-6",
              cursor: "w-full bg-app-primary dark:bg-app-dark-primary",
              tab: "max-w-fit px-0 h-14",
              tabContent: "group-data-[selected=true]:text-app-primary dark:group-data-[selected=true]:text-app-dark-primary text-app-text-muted dark:text-app-dark-text-muted font-medium"
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                title={
                  <div className="flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge
                        color={activeTab === tab.id ? 'primary' : getTabPriorityColor(tab.priority)}
                        size="sm"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>
      )}

      {/* Custom Children */}
      {children}
    </div>
  );
}
