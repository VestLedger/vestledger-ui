'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AICopilotContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openWithQuery: (query: string) => void;
  open: () => void;
  minimize: () => void;
  close: () => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export function AICopilotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const openWithQuery = (query: string) => {
    setPendingQuery(query);
    setIsMinimized(false);
    setIsOpen(true);
  };

  const open = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  const minimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const close = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  return (
    <AICopilotContext.Provider
      value={{
        isOpen,
        isMinimized,
        openWithQuery,
        open,
        minimize,
        close,
      }}
    >
      {children}
    </AICopilotContext.Provider>
  );
}

export function useAICopilot() {
  const context = useContext(AICopilotContext);
  if (!context) {
    throw new Error('useAICopilot must be used within AICopilotProvider');
  }
  return context;
}

// Hook for the AI Copilot component to get and clear pending queries
export function usePendingQuery() {
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  return {
    pendingQuery,
    clearPendingQuery: () => setPendingQuery(null),
    setPendingQuery,
  };
}
