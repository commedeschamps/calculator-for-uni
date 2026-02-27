'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Toast = {
  id: number;
  message: string;
  onUndo?: () => void;
};

type ToastContextValue = {
  showToast: (message: string, onUndo?: () => void) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, onUndo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span className="toast-message">{toast.message}</span>
            <div className="toast-actions">
              {toast.onUndo ? (
                <button
                  type="button"
                  className="toast-undo"
                  onClick={() => {
                    toast.onUndo?.();
                    dismiss(toast.id);
                  }}
                >
                  Undo
                </button>
              ) : null}
              <button
                type="button"
                className="toast-dismiss"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
