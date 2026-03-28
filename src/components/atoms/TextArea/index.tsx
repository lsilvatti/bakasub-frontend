import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from '../Input/Input.module.css'; 

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { 
      label, 
      error, 
      helperText, 
      fullWidth = true, 
      className, 
      disabled,
      id,
      ...props 
    }, 
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={clsx(
          styles.inputContainer,
          styles.textareaContainer, 
          error && styles.error,
          disabled && styles.disabled
        )}>
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            className={clsx(styles.baseInput, styles.textarea)}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <span className={clsx(styles.helperText, error && styles.errorText)}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';