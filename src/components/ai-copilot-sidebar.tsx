'use client'

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Lightbulb, Zap, Bot } from 'lucide-react';
import { Button, Input } from '@/ui';

// Context for controlling the AI Copilot from other components
interface AICopilotContextType {
  openWithQuery: (query: string) => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export function useAICopilot() {
  const context = useContext(AICopilotContext);
  if (!context) {
    throw new Error('useAICopilot must be used within AICopilotProvider');
  }
  return context;
}

// Global callback ref for cross-component communication
let globalOpenQueryCallback: ((query: string) => void) | null = null;

export function setGlobalOpenQueryCallback(callback: (query: string) => void) {
  globalOpenQueryCallback = callback;
}

// Provider component that can be used in layout
export function AICopilotProvider({ children }: { children: React.ReactNode }) {
  const contextValue = {
    openWithQuery: (query: string) => {
      if (globalOpenQueryCallback) {
        globalOpenQueryCallback(query);
      }
    },
  };

  return (
    <AICopilotContext.Provider value={contextValue}>
      {children}
    </AICopilotContext.Provider>
  );
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Zap;
  action: string;
}

interface Suggestion {
  id: string;
  text: string;
  reasoning: string;
  confidence: number;
}

// Mock AI responses based on context
const getContextualResponses = (pathname: string, query: string): string => {
  const lowerQuery = query.toLowerCase();

  // General queries
  if (lowerQuery.includes('deals') || lowerQuery.includes('pipeline')) {
    return "I found 12 active deals in your pipeline. 3 are in due diligence, 4 in term sheet negotiation, and 5 in initial review. Would you like me to show you the deals likely to close this quarter?";
  }

  if (lowerQuery.includes('capital call')) {
    return "You have 2 active capital calls: Fund II Series A ($5.2M, 87% collected) and Fund III Seed ($2.1M, 45% collected). Fund III has 3 overdue LPs. Would you like me to draft reminder emails?";
  }

  if (lowerQuery.includes('portfolio') || lowerQuery.includes('companies')) {
    return "Your portfolio has 23 active companies. 2 companies (CloudScale, BioTech) are flagged as at-risk due to runway < 12 months. 5 companies are performing above benchmark. Would you like a detailed health report?";
  }

  if (lowerQuery.includes('compliance') || lowerQuery.includes('deadline')) {
    return "You have 1 upcoming compliance deadline: Annual Fund Audit (due in 5 days, complexity: Medium). I've prepared a checklist of required documents. Would you like me to send reminders to your team?";
  }

  // Page-specific responses
  if (pathname === '/dashboard') {
    return "I'm analyzing your dashboard metrics. I noticed 3 overdue capital calls and 2 portfolio companies at risk. Would you like me to prioritize these items or show you predicted health trends?";
  }

  if (pathname === '/pipeline') {
    return "I'm currently viewing your pipeline. I can help you filter deals, predict close likelihood, or detect competitive conflicts. What would you like to explore?";
  }

  if (pathname.startsWith('/fund-admin')) {
    return "I'm in Fund Admin mode. I can help you draft capital calls, track LP responses, or forecast collection timelines. What task can I assist with?";
  }

  // Default response
  return `I'm here to help with "${query}". I can analyze your data, draft documents, or provide insights. Could you provide more context about what you're looking for?`;
};

// Mock contextual suggestions based on current page
const getPageSuggestions = (pathname: string): Suggestion[] => {
  const baseSuggestions: Record<string, Suggestion[]> = {
    '/dashboard': [
      {
        id: 'review-portfolio',
        text: 'Review at-risk portfolio companies',
        reasoning: '2 companies with runway < 12 months detected',
        confidence: 0.92,
      },
      {
        id: 'capital-calls',
        text: 'Follow up on overdue capital calls',
        reasoning: '3 capital calls overdue by 5+ days',
        confidence: 0.88,
      },
    ],
    '/pipeline': [
      {
        id: 'close-deals',
        text: 'Focus on deals likely to close this quarter',
        reasoning: 'Based on stage velocity and historical patterns',
        confidence: 0.78,
      },
      {
        id: 'conflict-check',
        text: 'Run conflict analysis on new deals',
        reasoning: '2 new deals may overlap with portfolio',
        confidence: 0.85,
      },
    ],
    '/portfolio': [
      {
        id: 'health-report',
        text: 'Generate Q4 portfolio health report',
        reasoning: 'Quarter ending soon, typical reporting time',
        confidence: 0.81,
      },
      {
        id: 'runway-analysis',
        text: 'Analyze runway forecasts for next 6 months',
        reasoning: '3 companies projected to need funding',
        confidence: 0.79,
      },
    ],
    '/fund-admin': [
      {
        id: 'draft-call',
        text: 'Draft next capital call for Fund III',
        reasoning: 'Based on deployment schedule',
        confidence: 0.86,
      },
      {
        id: 'lp-reminders',
        text: 'Send reminders to overdue LPs',
        reasoning: '3 LPs overdue on current call',
        confidence: 0.94,
      },
    ],
  };

  return baseSuggestions[pathname] || [
    {
      id: 'default',
      text: 'Analyze current page data',
      reasoning: 'I can provide insights on this section',
      confidence: 0.75,
    },
  ];
};

// Mock quick actions based on current page
const getQuickActions = (pathname: string): QuickAction[] => {
  const baseActions: Record<string, QuickAction[]> = {
    '/dashboard': [
      { id: 'summarize', label: 'Summarize Today', icon: Sparkles, action: 'Generate daily summary' },
      { id: 'urgent', label: 'Show Urgent Items', icon: Zap, action: 'Filter urgent tasks' },
    ],
    '/pipeline': [
      { id: 'analyze', label: 'Analyze Deals', icon: Sparkles, action: 'Run deal analysis' },
      { id: 'conflicts', label: 'Check Conflicts', icon: Zap, action: 'Detect conflicts' },
    ],
    '/fund-admin': [
      { id: 'draft-call', label: 'Draft Capital Call', icon: Sparkles, action: 'Generate capital call' },
      { id: 'track-lps', label: 'Track LPs', icon: Zap, action: 'Show LP status' },
    ],
  };

  return baseActions[pathname] || [
    { id: 'help', label: 'What can you do?', icon: Lightbulb, action: 'Show capabilities' },
  ];
};

function AICopilotSidebarInner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = getPageSuggestions(pathname);
  const quickActions = getQuickActions(pathname);

  // Function to handle opening with a query from external components
  const openWithQuery = (query: string) => {
    setIsMinimized(false);
    setIsOpen(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getContextualResponses(pathname, query),
        timestamp: new Date(),
        confidence: Math.random() * 0.2 + 0.75,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Register the callback when component mounts
  useEffect(() => {
    setGlobalOpenQueryCallback(openWithQuery);
    return () => {
      setGlobalOpenQueryCallback(() => {});
    };
  }, [pathname]); // Re-register when pathname changes to get updated context

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hi! I'm Vesta, your AI assistant. I'm here to help you navigate VestLedger, analyze data, and automate tasks. What would you like to do today?`,
        timestamp: new Date(),
        confidence: 0.95,
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getContextualResponses(pathname, inputValue),
        timestamp: new Date(),
        confidence: Math.random() * 0.2 + 0.75, // 0.75-0.95
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleQuickAction = (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I'm working on "${action.action}". This will take a moment...`,
        timestamp: new Date(),
        confidence: 0.88,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion.text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Great choice! I'm ${suggestion.reasoning.toLowerCase()}. Let me prepare that for you...`,
        timestamp: new Date(),
        confidence: suggestion.confidence,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Bubble Button - Like MS Office Assistant */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] shadow-lg flex items-center justify-center cursor-pointer group"
          >
            <Bot className="w-6 h-6 text-white" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-[var(--app-primary)] opacity-75 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Bubble Panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)] bg-gradient-to-r from-[var(--app-primary-bg)] to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-[var(--app-text)]">Vesta</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(true);
                  }}
                  className="p-1.5 rounded hover:bg-[var(--app-surface-hover)] transition-colors"
                  aria-label="Minimize"
                >
                  <X className="w-4 h-4 text-[var(--app-text-muted)]" />
                </button>
              </div>
            </div>

            {/* Suggestions Section */}
            {suggestions.length > 0 && messages.length <= 1 && (
              <div className="p-4 border-b border-[var(--app-border)] space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[var(--app-warning)]" />
                  <span className="text-xs font-semibold text-[var(--app-text-muted)]">
                    SUGGESTIONS
                  </span>
                </div>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-border)] transition-colors"
                  >
                    <p className="text-sm text-[var(--app-text)] mb-1">{suggestion.text}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--app-text-subtle)]">{suggestion.reasoning}</p>
                      <span className={`
                        text-xs font-semibold
                        ${suggestion.confidence >= 0.8 ? 'text-green-500' : suggestion.confidence >= 0.6 ? 'text-yellow-500' : 'text-red-500'}
                      `}>
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
                <span className="text-xs font-semibold text-[var(--app-text-muted)]">
                  QUICK ACTIONS
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map(action => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant="flat"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs"
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
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
                      ${message.type === 'user'
                        ? 'bg-[var(--app-primary)] text-white'
                        : 'bg-[var(--app-surface-hover)] text-[var(--app-text)]'
                      }
                    `}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.type === 'ai' && message.confidence && (
                      <p className="text-xs mt-1 opacity-70">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </p>
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
            <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Main export
export function AICopilotSidebar() {
  return <AICopilotSidebarInner />;
}
