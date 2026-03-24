import { NavItem } from '@/components/atoms';
import { useAppRoute } from '@/hooks/useAppRoute';
import { APP_ROUTES } from '@/config/routes';
import styles from './Navigation.module.css';

export function Navigation() {
    const { checkIsActive } = useAppRoute();

    return (
<nav className={styles.nav}>
      {APP_ROUTES.filter(route => route.showInSidebar).map((route) => (
        <NavItem
          key={route.path}
          to={route.path} 
          data-active={checkIsActive(route.path)}
        >
          {route.icon && <route.icon />}
          {route.title}
        </NavItem>
      ))}
    </nav>
    )
}