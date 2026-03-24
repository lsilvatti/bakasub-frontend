import { IconButton, ThemeToggle } from '@/components/atoms';
import styles from './Header.module.css';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => (
  <header className={styles.header}>
    <IconButton className={styles.menuButton} onClick={onMenuClick} aria-label="Abrir menu"><Menu/></IconButton>
    <ThemeToggle />
  </header>
);