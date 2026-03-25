import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Radio.module.css';

export interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: boolean;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, className, disabled, id, error, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <label 
        htmlFor={inputId} 
        className={clsx(styles.radioContainer, disabled && styles.disabled, className)}
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          disabled={disabled}
          className={clsx(styles.input, error && styles.error)}
          {...props}
        />
        <div className={styles.circle} aria-hidden="true">
          <div className={styles.dot} />
        </div>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';