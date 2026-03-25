import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error';
  hoverable?: boolean;
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, className, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={clsx(styles.card, styles[variant], hoverable && styles.hoverable, className)} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardRoot.displayName = 'Card';

export const Card = Object.assign(CardRoot, {
  Header: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.header, className)} {...props}>{children}</div>
  ),
  Title: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={clsx(styles.title, className)} {...props}>{children}</h3>
  ),
  Description: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={clsx(styles.description, className)} {...props}>{children}</p>
  ),
  Content: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.content, className)} {...props}>{children}</div>
  ),
  Footer: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.footer, className)} {...props}>{children}</div>
  ),
});