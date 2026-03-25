import React from 'react';
import clsx from 'clsx';
import styles from './Tooltip.module.css';

interface TooltipProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ text, children, className, position = 'top', variant = 'default' }: TooltipProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {children}
      <span className={clsx(styles.text, styles[position], variant && styles[variant])}>
        {text}
      </span>
    </div>
  );
}