import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Select.module.css';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { 
      label, 
      error, 
      helperText, 
      fullWidth = true, 
      options,
      placeholder,
      className, 
      disabled,
      id,
      value,
      defaultValue,
      ...props 
    }, 
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    const isControlled = value !== undefined && value !== null;
    
    const safeValue = isControlled ? value : undefined;
    
    const safeDefaultValue = !isControlled 
      ? (defaultValue ?? (placeholder ? "" : undefined)) 
      : undefined;

    return (
      <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={clsx(
          styles.selectContainer,
          error && styles.error,
          disabled && styles.disabled
        )}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={styles.baseSelect}
            value={safeValue}
            defaultValue={safeDefaultValue}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className={styles.iconContainer}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
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

Select.displayName = 'Select';