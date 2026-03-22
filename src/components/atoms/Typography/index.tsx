import clsx from 'clsx';
import styles from './Typography.module.css'

type TypographyVariants = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span' | 'body' | 'muted';

interface TypographyProps<C extends React.ElementType> { 
    variant?: TypographyVariants;
    as?: C;
    children?: React.ReactNode;
    className?: string;
}

type Props<C extends React.ElementType> = TypographyProps<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof TypographyProps<C>>

export function Typography<C extends React.ElementType = 'p'>({variant = 'body', as, children, className, ...props}:Props<C>) {

    const Component = ( as || 'p') as React.ElementType;
    return (    
        <Component
        className={clsx(styles.base, styles[variant], className)}
        {...props}
        
        >
            {children}
        </Component>
    )
} 