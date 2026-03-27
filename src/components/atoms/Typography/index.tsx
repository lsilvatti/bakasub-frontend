// src/components/atoms/Typography/index.tsx
import React from 'react';
import clsx from 'clsx';
import styles from './Typography.module.css';

// Expandindo as opções!
type TypographyVariants = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span' | 'body' | 'muted' | 'monospace' | 'small';
type TypographyWeights = 'normal' | 'medium' | 'semibold' | 'bold';
type TypographyColors = 'primary' | 'secondary' | 'error' | 'success';

interface TypographyProps<C extends React.ElementType> { 
    variant?: TypographyVariants;
    weight?: TypographyWeights;
    color?: TypographyColors;
    as?: C;
    children?: React.ReactNode;
    className?: string;
}

type Props<C extends React.ElementType> = TypographyProps<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof TypographyProps<C>>;

export function Typography<C extends React.ElementType = 'p'>({
    variant = 'body', 
    weight,
    color,
    as, 
    children, 
    className, 
    ...props
}: Props<C>) {
    // Se não passar a prop 'as', eu infiro inteligentemente a partir da variante!
    const defaultTag = ['h1', 'h2', 'h3', 'h4', 'h5'].includes(variant) 
        ? variant 
        : variant === 'span' ? 'span' : 'p';
        
    const Component = (as || defaultTag) as React.ElementType;

    return (    
        <Component
            className={clsx(
                styles.base, 
                styles[variant], 
                weight && styles[`weight-${weight}`],
                color && styles[`color-${color}`],
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}