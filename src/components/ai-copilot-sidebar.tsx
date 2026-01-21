'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Bot, ChevronRight, ChevronDown, Send } from 'lucide-react';
import { Button, Input } from '@/ui';
import { AICopilotBubble } from './ai-copilot-bubble';
import { useNavigation } from '@/contexts/navigation-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  openWithQueryRequested,
  quickActionInvoked,
  sendMessageRequested,
  setInputValue,
  setShowSuggestions,
  suggestionInvoked,
  copilotSuggestionsRequested,
  copilotSuggestionsSelectors,
} from '@/store/slices/copilotSlice';
import type { QuickAction, Suggestion } from '@/services/ai/copilotService';

type UITabState = {
  activeTab?: string;
  selectedTab?: string;
  selected?: string;
  viewMode?: string;
};

export function useAICopilot() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { sidebarState, toggleRightSidebar } = useNavigation();

  const openWithQuery = useCallback(
    (query: string) => {
      if (sidebarState.rightCollapsed) {
        toggleRightSidebar();
      }
      dispatch(openWithQueryRequested({ pathname, query }));
    },
    [dispatch, pathname, sidebarState.rightCollapsed, toggleRightSidebar]
  );

  return { openWithQuery };
}

export function AICopilotSidebar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { sidebarState, toggleRightSidebar } = useNavigation();
  const isCollapsed = sidebarState.rightCollapsed;

  const messages = useAppSelector((state) => state.copilot.messages);
  const inputValue = useAppSelector((state) => state.copilot.inputValue);
  const isTyping = useAppSelector((state) => state.copilot.isTyping);
  const showSuggestions = useAppSelector((state) => state.copilot.showSuggestions);
  const quickActionsOverride = useAppSelector((state) => state.copilot.quickActionsOverride);
  const suggestionsOverride = useAppSelector((state) => state.copilot.suggestionsOverride);

  // Use centralized selectors for suggestions/actions
  const suggestionsData = useAppSelector(copilotSuggestionsSelectors.selectData);

  const suggestions = useMemo(() => {
    const fallback = suggestionsData?.suggestions || [];
    return suggestionsOverride && suggestionsOverride.length > 0 ? suggestionsOverride : fallback;
  }, [suggestionsData, suggestionsOverride]);

  const quickActions = useMemo(() => {
    const fallback = suggestionsData?.quickActions || [];
    return quickActionsOverride && quickActionsOverride.length > 0 ? quickActionsOverride : fallback;
  }, [suggestionsData, quickActionsOverride]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Get the active tab from UI state based on current page
  const uiState = useAppSelector((state) => state.ui.byKey);
  const getCurrentTab = useCallback(() => {
    const getTabValue = (key: string, field: keyof UITabState) => {
      const state = uiState[key] as UITabState | undefined;
      return state?.[field] ?? null;
    };

    // Extract tab from page-specific UI state
    if (pathname === '/contacts') {
      return getTabValue('crm-contacts', 'activeTab');
    }
    if (pathname === '/lp-portal') {
      return getTabValue('lp-investor-portal', 'selectedTab');
    }
    if (pathname === '/lp-management') {
      return getTabValue('lp-management', 'selectedTab');
    }
    if (pathname === '/deal-intelligence') {
      return getTabValue('deal-intelligence', 'viewMode');
    }
    if (pathname === '/fund-admin') {
      return getTabValue('back-office-fund-admin', 'selectedTab');
    }
    if (pathname === '/compliance') {
      return getTabValue('back-office-compliance', 'selectedTab');
    }
    if (pathname === '/tax-center') {
      return getTabValue('back-office-tax-center', 'selectedTab');
    }
    if (pathname === '/409a-valuations') {
      return getTabValue('back-office-valuation-409a', 'selectedTab');
    }
    if (pathname === '/analytics') {
      return getTabValue('analytics', 'selected');
    }
    if (pathname === '/portfolio') {
      return getTabValue('portfolio', 'selected');
    }
    if (pathname === '/ai-tools') {
      return getTabValue('ai-tools', 'selected');
    }
    return null;
  }, [pathname, uiState]);

  const currentTab = getCurrentTab();

  // Load suggestions/actions when pathname or tab changes
  useEffect(() => {
    dispatch(copilotSuggestionsRequested({ pathname, tab: currentTab }));
    dispatch(setShowSuggestions(true));
  }, [dispatch, pathname, currentTab]);

  const handleSendMessage = useCallback(() => {
    dispatch(sendMessageRequested({ pathname, content: inputValue }));
  }, [dispatch, inputValue, pathname]);

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      action.onClick?.();
      dispatch(quickActionInvoked({ pathname, action }));
    },
    [dispatch, pathname]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      dispatch(suggestionInvoked({ suggestion }));
    },
    [dispatch]
  );

  if (isCollapsed) {
    return <AICopilotBubble onClick={toggleRightSidebar} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 h-[69px] border-b border-app-border dark:border-app-dark-border bg-gradient-to-r from-app-primary/10 dark:from-app-dark-primary/15 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-app-primary dark:from-app-dark-primary to-app-secondary dark:to-app-dark-secondary flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-app-text dark:text-app-dark-text">Vesta AI Copilot</h2>
        </div>
        {/* Minimize button */}
        <button
          onClick={toggleRightSidebar}
          className="p-1.5 rounded-lg hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
          aria-label="Minimize AI Copilot"
        >
          <ChevronRight className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
        </button>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="p-4 border-b border-app-border dark:border-app-dark-border space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-app-warning dark:text-app-dark-warning" />
              <span className="text-xs font-semibold text-app-text-muted dark:text-app-dark-text-muted">SUGGESTIONS</span>
            </div>
            <button
              onClick={() => dispatch(setShowSuggestions(!showSuggestions))}
              className="p-1 rounded-lg hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
              aria-label="Toggle suggestions visibility"
            >
              <ChevronDown
                className={`w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted transition-transform ${showSuggestions ? '' : '-rotate-90'}`}
              />
            </button>
          </div>
          {showSuggestions &&
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 rounded-lg bg-app-surface-hover dark:bg-app-dark-surface-hover hover:bg-app-border dark:hover:bg-app-dark-border transition-colors"
              >
                <p className="text-sm text-app-text dark:text-app-dark-text mb-1">{suggestion.text}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-text-subtle dark:text-app-dark-text-subtle">{suggestion.reasoning}</p>
                  <span
                    className={`
                      text-xs font-semibold
                      ${suggestion.confidence >= 0.8 ? 'text-green-500' : suggestion.confidence >= 0.6 ? 'text-yellow-500' : 'text-red-500'}
                    `}
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-b border-app-border dark:border-app-dark-border">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
          <span className="text-xs font-semibold text-app-text-muted dark:text-app-dark-text-muted">QUICK ACTIONS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant="flat"
              onClick={() => handleQuickAction(action)}
              title={action.description || action.action}
              className={`text-xs ${action.aiSuggested ? 'bg-app-primary/10 dark:bg-app-dark-primary/15' : ''}`}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-3 py-2 rounded-lg
                ${message.type === 'user' ? 'bg-app-primary dark:bg-app-dark-primary text-white' : 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text dark:text-app-dark-text'}
              `}
            >
              <p className="text-sm">{message.content}</p>
              {message.type === 'ai' && message.confidence && (
                <p className="text-xs mt-1 opacity-70">Confidence: {Math.round(message.confidence * 100)}%</p>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-app-surface-hover dark:bg-app-dark-surface-hover px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-app-text-muted dark:bg-app-dark-text-muted rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-app-text-muted dark:bg-app-dark-text-muted rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-app-text-muted dark:bg-app-dark-text-muted rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-8">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => dispatch(setInputValue(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            size="sm"
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
