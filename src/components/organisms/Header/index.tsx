import { IconButton, LanguageSwitcher, Link, ThemeToggle, Typography } from '@/components/atoms';
import styles from './Header.module.css';
import { Menu, Settings } from 'lucide-react';
import { useAppRoute } from '@/hooks/useAppRoute';
import clsx from 'clsx';
import { Tooltip } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'node_modules/i18next/typescript/t';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { title, checkIsActive } = useAppRoute();
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <IconButton className={styles.menuButton} onClick={onMenuClick} aria-label={'Menu'}><Menu /></IconButton>
      <Typography variant="h3" className={styles.title}>
        {t(title as ParseKeys)}
      </Typography>

      <div className={styles.iconButtons}>
        <Link to={'/config'}>
          <Tooltip position='bottom' text={t('pages.settings.title' as ParseKeys)}>
            <IconButton className={clsx({ [styles.active]: checkIsActive('/config') }, styles.configButton)} aria-label={t('pages.settings.title' as ParseKeys)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}