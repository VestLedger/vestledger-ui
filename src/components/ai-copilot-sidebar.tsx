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
} from '@/store/slices/copilotSlice';
import { getCopilotPageSuggestions, getCopilotQuickActions, type QuickAction, type Suggestion } from '@/services/ai/copilotService';

export function useAICopilot() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const openWithQuery = useCallback(
    (query: string) => {
      dispatch(openWithQueryRequested({ pathname, query }));
    },
    [dispatch, pathname]
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

  const suggestions = useMemo(() => {
    const fallback = getCopilotPageSuggestions(pathname);
    return suggestionsOverride && suggestionsOverride.length > 0 ? suggestionsOverride : fallback;
  }, [pathname, suggestionsOverride]);

  const quickActions = useMemo(() => {
    const fallback = getCopilotQuickActions(pathname);
    return quickActionsOverride && quickActionsOverride.length > 0 ? quickActionsOverride : fallback;
  }, [pathname, quickActionsOverride]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    dispatch(setShowSuggestions(true));
  }, [dispatch, pathname]);

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
      <div className="flex items-center justify-between gap-2 px-4 h-[69px] border-b border-[var(--app-border)] bg-gradient-to-r from-[var(--app-primary-bg)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Vesta AI Copilot</h2>
        </div>
        {/* Minimize button */}
        <button
          onClick={toggleRightSidebar}
          className="p-1.5 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
          aria-label="Minimize AI Copilot"
        >
          <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
        </button>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="p-4 border-b border-[var(--app-border)] space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--app-warning)]" />
              <span className="text-xs font-semibold text-[var(--app-text-muted)]">SUGGESTIONS</span>
            </div>
            <button
              onClick={() => dispatch(setShowSuggestions(!showSuggestions))}
              className="p-1 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
              aria-label="Toggle suggestions visibility"
            >
              <ChevronDown
                className={`w-4 h-4 text-[var(--app-text-muted)] transition-transform ${showSuggestions ? '' : '-rotate-90'}`}
              />
            </button>
          </div>
          {showSuggestions &&
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-border)] transition-colors"
              >
                <p className="text-sm text-[var(--app-text)] mb-1">{suggestion.text}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--app-text-subtle)]">{suggestion.reasoning}</p>
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
      <div className="p-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[var(--app-primary)]" />
          <span className="text-xs font-semibold text-[var(--app-text-muted)]">QUICK ACTIONS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant="flat"
              onClick={() => handleQuickAction(action)}
              title={action.description || action.action}
              className={`text-xs ${action.aiSuggested ? 'bg-[var(--app-primary-bg)]' : ''}`}
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
                ${message.type === 'user' ? 'bg-[var(--app-primary)] text-white' : 'bg-[var(--app-surface-hover)] text-[var(--app-text)]'}
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
            <div className="bg-[var(--app-surface-hover)] px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-[var(--app-text-muted)] rounded-full"
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
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
