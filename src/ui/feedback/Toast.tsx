"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastOptions = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastContextValue = {
  push: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 4000;

const variantStyles: Record<ToastVariant, { background: string; text: string; border: string }> = {
  info: {
    background: "bg-app-info/10 dark:bg-app-dark-info/15",
    text: "text-app-info dark:text-app-dark-info",
    border: "border-app-info/20 dark:border-app-dark-info/20",
  },
  success: {
    background: "bg-app-success/10 dark:bg-app-dark-success/15",
    text: "text-app-success dark:text-app-dark-success",
    border: "border-app-success/20 dark:border-app-dark-success/20",
  },
  warning: {
    background: "bg-app-warning/10 dark:bg-app-dark-warning/15",
    text: "text-app-warning dark:text-app-dark-warning",
    border: "border-app-warning/20 dark:border-app-dark-warning/20",
  },
  error: {
    background: "bg-app-danger/10 dark:bg-app-dark-danger/15",
    text: "text-app-danger dark:text-app-dark-danger",
    border: "border-app-danger/20 dark:border-app-dark-danger/20",
  },
};

const createToastId = () =>
  `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => {
        const styles = variantStyles[toast.variant];
        const role = toast.variant === "error" || toast.variant === "warning" ? "alert" : "status";
        return (
          <div
            key={toast.id}
            role={role}
            aria-live={role === "alert" ? "assertive" : "polite"}
            className={`rounded-lg border px-3 py-2 shadow-lg ${styles.background} ${styles.text} ${styles.border}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
                <div className="text-xs text-app-text-muted dark:text-app-dark-text-muted">{toast.message}</div>
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
                className="rounded-md p-1 text-app-text-muted dark:text-app-dark-text-muted hover:text-app-text dark:hover:text-app-dark-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timeouts.current[id]) {
      window.clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const push = useCallback(
    (options: ToastOptions) => {
      const id = createToastId();
      const item: ToastItem = {
        id,
        title: options.title,
        message: options.message,
        variant: options.variant ?? "info",
        durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
      };
      setToasts((prev) => [...prev, item]);
      if (item.durationMs > 0) {
        timeouts.current[id] = window.setTimeout(() => dismiss(id), item.durationMs);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [dismiss, push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return {
    push: context.push,
    dismiss: context.dismiss,
    info: (message: string, title?: string) =>
      context.push({ message, title, variant: "info" }),
    success: (message: string, title?: string) =>
      context.push({ message, title, variant: "success" }),
    warning: (message: string, title?: string) =>
      context.push({ message, title, variant: "warning" }),
    error: (message: string, title?: string) =>
      context.push({ message, title, variant: "error" }),
  };
}
