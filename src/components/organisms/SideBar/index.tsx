import { Navigation } from '@/components/molecules';
import styles from './SideBar.module.css';
import { Logo } from '@/components/atoms';

interface SidebarProps {
  isOpen: boolean;
}

export const SideBar = ({ isOpen }: SidebarProps) => (
  <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
    <div className={styles.logo}>
      <Logo />
    </div>
    <Navigation />
  </aside>
);