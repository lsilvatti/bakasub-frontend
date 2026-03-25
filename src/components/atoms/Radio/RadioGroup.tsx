import React from 'react';
import clsx from 'clsx';
import styles from './Radio.module.css';

export interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label?: string;
  error?: string;
  direction?: 'row' | 'column';
  children: React.ReactNode;
}

export function RadioGroup({ 
  label, 
  error, 
  direction = 'column', 
  children, 
  className,
  ...props 
}: RadioGroupProps) {
  return (
    <fieldset className={clsx(styles.groupWrapper, className)} {...props}>
      {label && <legend className={styles.groupLabel}>{label}</legend>}
      
      <div className={clsx(styles.optionsContainer, styles[direction])}>
        {children}
      </div>

      {error && <span className={styles.groupError}>{error}</span>}
    </fieldset>
  );
}