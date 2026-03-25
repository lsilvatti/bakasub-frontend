import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import clsx from 'clsx';
import styles from '../components/atoms/Toast/Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';
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

interface ToastContextData {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ 
  children, 
  position = 'bottom-right' 
}: { 
  children: ReactNode;
  position?: ToastPosition;
}) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id, duration: toast.duration || 5000 };
    setToasts((state) => [...state, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      <div className={clsx(styles.viewport, styles[position])}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const icons = {
    success: (
      <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    error: (
      <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
    ),
    info: (
      <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    )
  };

  return (
    <div className={clsx(styles.toast, styles[toast.type], isClosing && styles.closing)}>
      {icons[toast.type]}
      <div className={styles.content}>
        {toast.title && <span className={styles.title}>{toast.title}</span>}
        <span className={styles.message}>{toast.message}</span>
      </div>
      <button className={styles.closeButton} onClick={handleClose} aria-label="Fechar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}