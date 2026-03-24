import { Link } from 'react-router-dom';
import styles from './NavItem.module.css';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

export function NavItem({ href, children }: NavItemProps) {
    return (
        <Link className={styles.navItem} to={href}>
            {children}
        </Link>
    )
}
