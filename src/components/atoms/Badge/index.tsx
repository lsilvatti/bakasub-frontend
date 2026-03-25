import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
}