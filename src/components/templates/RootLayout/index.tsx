import { useState, useEffect } from 'react';
import { Overlay } from '@/components/atoms';
import { SideBar, Header, JobsSidePanel } from '@/components/organisms';
import styles from './RootLayout.module.css';
import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1600) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.container}>
      {isSidebarOpen && <Overlay onClick={() => setIsSidebarOpen(false)} />}
      
      <SideBar isOpen={isSidebarOpen} />

      <div className={styles.mainWrapper}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={styles.content}>
            <Outlet />
        </main>
      </div>

      <JobsSidePanel />
    </div>
  );
};