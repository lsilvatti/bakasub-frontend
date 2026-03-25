import React, { useState, forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { 
      label, 
      error, 
      helperText, 
      fullWidth = true, 
      className, 
      type = 'text', 
      leftIcon, 
      rightIcon, 
      disabled,
      id,
      ...props 
    }, 
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={clsx(
          styles.inputContainer,
          error && styles.error,
          disabled && styles.disabled
        )}>
          {leftIcon && <div className={styles.iconLeft}>{leftIcon}</div>}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={styles.baseInput}
            {...props}
          />

          {(isPassword || rightIcon) && (
            <div className={styles.iconRight}>
              {isPassword ? (
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
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

Input.displayName = 'Input';