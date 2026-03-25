import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './Dialog.module.css';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  closeOnOverlayClick?: boolean;
}

const DialogRoot = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md', 
  className,
  closeOnOverlayClick = true 
}: DialogProps) => {

  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayClick} role="presentation">
      <div 
        className={clsx(styles.dialog, styles[size], className)} 
        role="dialog" 
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const Dialog = Object.assign(DialogRoot, {
  Header: ({ title, onClose, className, children }: { title?: string; onClose?: () => void; className?: string; children?: React.ReactNode }) => (
    <div className={clsx(styles.header, className)}>
      {title ? <h3 className={styles.title}>{title}</h3> : children}
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  ),
  Content: ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.content, className)}>{children}</div>
  ),
  Footer: ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.footer, className)}>{children}</div>
  ),
});