import { NavItem } from '../../atoms/NavItem';
import styles from './Navigation.module.css';

export function Navigation() {
    return (
        <nav className={styles.nav}>
            <NavItem href="/dashboard">Dashboard</NavItem>
            <NavItem href="/videos">Vídeos</NavItem>
            <NavItem href="/config">Configurações</NavItem>
        </nav>
    )
}