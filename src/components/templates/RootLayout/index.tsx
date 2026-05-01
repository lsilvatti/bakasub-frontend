import { useState, useEffect } from 'react';
import { Overlay } from '@/components/atoms';
import { SideBar, Header, JobsSidePanel } from '@/components/organisms';
import { useHealthStatus, useToast } from '@/hooks';
import { useTranslation } from 'react-i18next';
import styles from './RootLayout.module.css';
import { Outlet } from 'react-router-dom';

const VIDEO_TOOLS_WARNING_KEY = 'bakasub-video-tools-warning';

export const RootLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();
  const { healthStatus } = useHealthStatus();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1600) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  if (!healthStatus || healthStatus.videoTools.videoProcessingAvailable) {
    return;
  }

  const missingToolsKey = `${VIDEO_TOOLS_WARNING_KEY}:${healthStatus.videoTools.missingTools.join(',')}`;
  if (window.sessionStorage.getItem(missingToolsKey)) {
    return;
  }

  toast.warning(
    t('pages.settings.videoTools.toast', { tools: healthStatus.videoTools.missingTools.join(', ') }),
    t('pages.settings.videoTools.title'),
    9000,
  );
  window.sessionStorage.setItem(missingToolsKey, '1');
  }, [healthStatus, t, toast]);

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