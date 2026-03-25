import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Switch.module.css';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, helperText, error, className, disabled, id, ...props }, ref) => {
    const inputId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <label 
        htmlFor={inputId} 
        className={clsx(styles.container, disabled && styles.disabled, className)}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          disabled={disabled}
          className={clsx(styles.input, error && styles.error)}
          {...props}
        />
        
        <div className={styles.track} aria-hidden="true">
          <div className={styles.thumb} />
        </div>
        
        {(label || helperText || error) && (
          <div className={styles.content}>
            {label && <span className={styles.label}>{label}</span>}
            {(error || helperText) && (
              <span className={clsx(styles.helperText, error && styles.errorText)}>
                {error || helperText}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';