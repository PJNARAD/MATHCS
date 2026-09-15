import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Check, Info, RotateCcw, X } from 'lucide-react';

interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  tone?: 'info' | 'success';
}

interface ToastRecord extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => undefined });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: ToastRecord = { id, message, ...options };
    setToasts((items) => [...items.filter((item) => item.id !== id), toast].slice(-3));
    const duration = options.duration ?? (options.onAction ? 6000 : 3000);
    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack no-print" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" role="status">
            <span className={`toast-icon ${toast.tone === 'success' ? 'text-moss' : 'text-blue'}`}>
              {toast.tone === 'success' ? <Check size={14} /> : <Info size={14} />}
            </span>
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.onAction && toast.actionLabel && (
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue hover:text-blued"
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
              >
                <RotateCcw size={12} /> {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              className="shrink-0 text-ink4 hover:text-ink"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
