'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/ui';
import { motion, AnimatePresence } from 'framer-motion';

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'left' | 'right';
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

const widthClasses = {
  sm: 'w-full sm:w-96',
  md: 'w-full sm:w-[32rem]',
  lg: 'w-full sm:w-[48rem]',
  xl: 'w-full sm:w-[64rem]',
  full: 'w-full',
};

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  position = 'right',
  footer,
  showCloseButton = true,
}: SideDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleBackdropClick}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{
              x: position === 'right' ? '100%' : '-100%',
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: position === 'right' ? '100%' : '-100%',
            }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full ${
              widthClasses[width]
            } bg-[var(--app-surface)] border-${position === 'right' ? 'l' : 'r'} border-[var(--app-border)] shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-[var(--app-border)]">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-xl font-semibold text-[var(--app-text)]">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-[var(--app-text-muted)] mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="light"
                    size="sm"
                    isIconOnly
                    onPress={onClose}
                    className="ml-4"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-[var(--app-border)] bg-[var(--app-surface-hover)]">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
