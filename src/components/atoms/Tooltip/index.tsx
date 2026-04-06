import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './Tooltip.module.css';

interface TooltipProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GAP = 8;

function getCoords(rect: DOMRect, position: string) {
  switch (position) {
    case 'bottom': return { top: rect.bottom + GAP, left: rect.left + rect.width / 2 };
    case 'left':   return { top: rect.top + rect.height / 2, left: rect.left - GAP };
    case 'right':  return { top: rect.top + rect.height / 2, left: rect.right + GAP };
    default:       return { top: rect.top - GAP, left: rect.left + rect.width / 2 };
  }
}

export function Tooltip({ text, children, className, position = 'top', variant = 'default' }: TooltipProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    if (wrapperRef.current) {
      setCoords(getCoords(wrapperRef.current.getBoundingClientRect(), position));
    }
  }, [position]);

  const hide = useCallback(() => setCoords(null), []);

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.wrapper, className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {coords && createPortal(
        <span
          className={clsx(styles.text, styles[position], styles[variant])}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
        </span>,
        document.body
      )}
    </div>
  );
}