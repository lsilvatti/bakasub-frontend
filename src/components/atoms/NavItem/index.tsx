import { Link } from 'react-router-dom';
import styles from './NavItem.module.css';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  'data-active'?: boolean;
}

export function NavItem({ to, children, 'data-active': dataActive }: NavItemProps) {
    return (
        <Link className={styles.navItem} to={to} data-active={dataActive ? "true" : "false"}>
            {children}
        </Link>
    )
}
