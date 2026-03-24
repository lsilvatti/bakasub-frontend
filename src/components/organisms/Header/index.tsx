import { IconButton, Link, ThemeToggle, Typography } from '@/components/atoms';
import styles from './Header.module.css';
import { Menu, Settings } from 'lucide-react';
import { useAppRoute } from '@/hooks/useAppRoute';
import clsx from 'clsx';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { title, checkIsActive } = useAppRoute();

  return (
    <header className={styles.header}>
      <IconButton className={styles.menuButton} onClick={onMenuClick} aria-label="Abrir menu"><Menu /></IconButton>
      <Typography variant="h3" className={styles.title}>
        {title}
      </Typography>

      <div className={styles.iconButtons}>
        <Link to={'/config'}>
          <IconButton className={clsx({ [styles.active]: checkIsActive('/config')}, styles.configButton)} aria-label="Configurações">
            <Settings />
          </IconButton>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}