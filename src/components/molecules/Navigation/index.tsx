import { NavItem } from '@/components/atoms';
import { useAppRoute } from '@/hooks/useAppRoute';
import { APP_ROUTES } from '@/config/routes';
import styles from './Navigation.module.css';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

export function Navigation() {
    const { checkIsActive } = useAppRoute();
    const { t } = useTranslation();

    return (
<nav className={styles.nav}>
      {APP_ROUTES.filter(route => route.showInSidebar).map((route) => (
        <NavItem
          key={route.path}
          to={route.path} 
          data-active={checkIsActive(route.path)}
        >
          {route.icon && <route.icon />}
          {t(route.title as ParseKeys)}
        </NavItem>
      ))}
    </nav>
    )
}