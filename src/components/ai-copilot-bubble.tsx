'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface AICopilotBubbleProps {
  onClick: () => void;
  unreadCount?: number;
}

export function AICopilotBubble({ onClick, unreadCount }: AICopilotBubbleProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full
                 bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]
                 shadow-2xl flex items-center justify-center z-50
                 hover:shadow-[0_0_30px_var(--royal-glow-purple)]
                 transition-shadow cursor-pointer"
      aria-label="Open AI Copilot"
    >
      {/* Pulse ring animation */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[var(--app-primary)]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Bot className="w-7 h-7 text-white z-10" />

      {/* Badge for unread messages */}
      {unreadCount && unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-[var(--app-danger)]
                       text-white min-w-[20px] h-5 rounded-full flex items-center
                       justify-center text-xs font-bold px-1.5">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </motion.button>
  );
}
