'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import SuccessToastNotification from '@/components/ui/success-toast-notification';

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
          <SuccessToastNotification
            key={toast.id}
            title={toast.message}
            description={toast.onUndo ? 'You can still undo this action for a few seconds.' : 'Your latest change was saved in the current view.'}
            actionLabel={toast.onUndo ? 'Undo' : undefined}
            onAction={toast.onUndo ? () => {
              toast.onUndo?.();
              dismiss(toast.id);
            } : undefined}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
