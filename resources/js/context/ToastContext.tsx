import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import ToastContainer from '@/components/ToastContainer';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  position: ToastPosition;
}

interface ToastContextValue {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => number;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => number;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => number;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => number;
  show: (message: string, options?: ToastOptions) => number;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = toastId++;

      const toast: Toast = {
        id,
        message,
        type: options.type || 'info',
        duration: options.duration ?? 5000,
        position: options.position || 'top-right',
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ✅ FIX: useMemo instead of useCallback
  const toast: ToastContextValue = useMemo(
    () => ({
      success: (message, options) =>
        addToast(message, { ...options, type: 'success' }),

      error: (message, options) =>
        addToast(message, { ...options, type: 'error' }),

      warning: (message, options) =>
        addToast(message, { ...options, type: 'warning' }),

      info: (message, options) =>
        addToast(message, { ...options, type: 'info' }),

      show: addToast,
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};