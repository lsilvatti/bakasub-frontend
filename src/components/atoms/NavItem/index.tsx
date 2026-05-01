import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavItem.module.css';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  'data-active'?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export function NavItem({ to, children, 'data-active': dataActive, disabled = false, onClick }: NavItemProps) {
    const handleLinkClick = onClick
        ? (event: MouseEvent<HTMLAnchorElement>) => onClick(event)
        : undefined;

    const handleButtonClick = onClick
        ? (event: MouseEvent<HTMLButtonElement>) => onClick(event)
        : undefined;

    if (disabled) {
        return (
            <button
                type="button"
                className={styles.navItem}
                data-active={dataActive ? "true" : "false"}
                data-disabled="true"
                aria-disabled="true"
                onClick={handleButtonClick}
            >
                {children}
            </button>
        );
    }

    return (
        <Link
            className={styles.navItem}
            to={to}
            data-active={dataActive ? "true" : "false"}
            data-disabled="false"
            onClick={handleLinkClick}
        >
            {children}
        </Link>
    )
}
