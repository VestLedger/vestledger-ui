'use client'

import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AISuggestion {
  label: string;
  href: string;
  reasoning: string;
  confidence: number;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  aiSuggestion?: AISuggestion;
}

export function Breadcrumb({ items, aiSuggestion }: BreadcrumbProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-2 text-sm mb-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-app-text-muted dark:text-app-dark-text-muted hover:text-app-primary dark:hover:text-app-dark-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-app-text dark:text-app-dark-text font-medium' : 'text-app-text-muted dark:text-app-dark-text-muted'}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-4 h-4 text-app-text-subtle dark:text-app-dark-text-subtle" />
              )}
            </div>
          );
        })}
      </nav>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="relative inline-block group">
          <button className="flex items-center gap-2 text-xs text-app-primary dark:text-app-dark-primary hover:text-app-primary-hover dark:hover:text-app-dark-primary-hover transition-colors">
            <Sparkles className="w-3 h-3" />
            <span>Frequently visited next: {aiSuggestion.label}</span>
          </button>

          {/* Invisible bridge to prevent tooltip from closing when cursor moves to it */}
          <div className="absolute top-full left-0 w-full h-2 opacity-0 group-hover:opacity-100 pointer-events-auto" />

          {/* Tooltip */}
          <motion.div
            initial={false}
            className="absolute top-full left-0 mt-2 z-10 opacity-0 translate-y-[-5px] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150"
          >
            <div className="bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-lg shadow-xl p-3 min-w-[280px]">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-app-primary dark:text-app-dark-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-app-text dark:text-app-dark-text mb-1">
                    AI Navigation Suggestion
                  </p>
                  <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted mb-2">
                    {aiSuggestion.reasoning}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-app-surface-hover dark:bg-app-dark-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-app-primary dark:bg-app-dark-primary rounded-full"
                        style={{ width: `${aiSuggestion.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-app-primary dark:text-app-dark-primary">
                      {Math.round(aiSuggestion.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={aiSuggestion.href}
                className="block w-full text-center py-2 px-3 rounded bg-app-primary/10 dark:bg-app-dark-primary/15 hover:bg-app-primary/20 dark:hover:bg-app-dark-primary/25 text-xs font-medium text-app-primary dark:text-app-dark-primary transition-colors"
              >
                Go to {aiSuggestion.label}
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
