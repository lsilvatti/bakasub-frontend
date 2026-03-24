import { Navigation } from '@/components/molecules';
import styles from './SideBar.module.css';
import { BakaSubLogo } from '@/assets/svg/BakaSubLogo';

interface SidebarProps {
  isOpen: boolean;
}

export const SideBar = ({ isOpen }: SidebarProps) => (
  <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
    <div className={styles.logo}>
      <BakaSubLogo />
    </div>
    <Navigation />
  </aside>
);