import clsx from "clsx";
import type { ReactNode } from "react"
import styles from './IconButton.module.css'

interface IconButtonProps<C extends React.ElementType> { 
    children: ReactNode;
    className?: string;
    alt?: string;
    as?: C;
}

type Props<C extends React.ElementType> = IconButtonProps<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof IconButtonProps<C>>

export function IconButton<C extends React.ElementType = 'button'>({ children, className, alt, as, ...props }: Props<C>) {
    const Component = (as || 'button') as React.ElementType;

    return (
        <Component className={clsx(styles.base, className)} alt={alt} {...props}>
            {children}            
        </Component>
    )
} 