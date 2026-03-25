import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, className, disabled, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <label 
        htmlFor={inputId} 
        className={clsx(styles.container, disabled && styles.disabled, className)}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          className={clsx(styles.input, error && styles.error)}
          {...props}
        />
        <div className={styles.box} aria-hidden="true">
          <svg 
            className={styles.icon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
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

Checkbox.displayName = 'Checkbox';