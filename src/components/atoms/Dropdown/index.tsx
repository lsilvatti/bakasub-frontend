import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Dropdown.module.css';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

let triggerElement = trigger;

  if (React.isValidElement(trigger)) {
    const child = trigger as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
      className?: string;
    }>;

    triggerElement = React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        setIsOpen(!isOpen);
        if (child.props.onClick) {
          child.props.onClick(e);
        }
      },
      className: clsx(child.props.className, isOpen && styles.triggerActive),
    });
  }

  return (
    <div className={clsx(styles.container, className)} ref={ref}>
      {triggerElement}
      
      {isOpen && (
        <div 
          className={clsx(styles.menu, styles[align])} 
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function DropdownItem({ active, className, children, ...props }: DropdownItemProps) {
  return (
    <button className={clsx(styles.item, active && styles.active, className)} {...props}>
      {children}
    </button>
  );
}