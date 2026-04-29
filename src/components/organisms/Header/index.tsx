import { IconButton, ThemeToggle, Typography } from '@/components/atoms';
import styles from './Header.module.css';
import { Menu } from 'lucide-react';
import { useAppRoute } from '@/hooks/useAppRoute';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { title } = useAppRoute();
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <IconButton className={styles.menuButton} onClick={onMenuClick} aria-label={'Menu'}><Menu /></IconButton>
      <Typography variant="h3" className={styles.title}>
        {t(title as ParseKeys)}
      </Typography>

      <div className={styles.iconButtons}>
        <ThemeToggle />
      </div>
    </header>
  );
}