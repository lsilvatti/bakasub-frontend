import { NavItem } from '@/components/atoms';
import { useAppRoute } from '@/hooks/useAppRoute';
import { APP_ROUTES, isSeparator } from '@/config/routes';
import styles from './Navigation.module.css';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

export function Navigation() {
    const { checkIsActive } = useAppRoute();
    const { t } = useTranslation();

    return (
        <nav className={styles.nav}>
            {APP_ROUTES.map((entry, index) => {
                if (isSeparator(entry)) {
                    return <hr key={`sep-${index}`} className={styles.separator} />;
                }
                if (!entry.showInSidebar) return null;
                return (
                    <NavItem
                        key={entry.path}
                        to={entry.path}
                        data-active={checkIsActive(entry.path)}
                    >
                        {entry.icon && <entry.icon />}
                        {t(entry.title as ParseKeys)}
                    </NavItem>
                );
            })}
        </nav>
    );
}