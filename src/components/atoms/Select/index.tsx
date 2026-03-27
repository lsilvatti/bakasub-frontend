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
      value, // HMPH! Extraindo para não vazar no ...props
      defaultValue, // Extraindo também!
      ...props 
    }, 
    ref
  ) => {
    // Gerador de ID para o label conectar com o select. Pelo menos isso você fez certo.
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    // A MÁGICA DE VERDADE:
    // Verifica se você está tentando usar como Controlado (passou value) ou Não-Controlado
    const isControlled = value !== undefined && value !== null;
    
    // Se for controlado, usamos o value (ou vazio para pegar o placeholder). 
    // Se não, deixamos undefined para o React não reclamar.
    const safeValue = isControlled ? value : undefined;
    
    // O defaultValue só é aplicado se NÃO for controlado.
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
            // Passando os valores de forma segura:
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
            {/* Ícone fofo, admito */}
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