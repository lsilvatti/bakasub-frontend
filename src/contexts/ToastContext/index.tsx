import React, { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import { ToastItem } from '@/components/atoms';
import styles from '@/components/atoms/Toast/Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextData {
  addToast: (payload: string | Omit<ToastMessage, 'id'>, type?: ToastType) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextData>({} as ToastContextData);

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'bottom-right' 
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((payload: string | Omit<ToastMessage, 'id'>, fallbackType: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newToast: ToastMessage = typeof payload === 'string'
      ? { id, message: payload, type: fallbackType, duration: 5000 }
      : { ...payload, id, duration: payload.duration ?? 5000 };

    setToasts((state) => [...state, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string, duration?: number) => 
    addToast({ message, title, type: 'success', duration }), [addToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => 
    addToast({ message, title, type: 'error', duration }), [addToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => 
    addToast({ message, title, type: 'info', duration }), [addToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => 
    addToast({ message, title, type: 'warning', duration }), [addToast]);

  const contextValue = useMemo(() => ({
    addToast, success, error, info, warning, removeToast
  }), [addToast, success, error, info, warning, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className={clsx(styles.viewport, styles[position])} aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};