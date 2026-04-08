import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, children, className }: TabsProps) {
  return (
    <div className={clsx(styles.tabs, className)}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={clsx(styles.tab, activeTab === tab.id && styles.tabActive)}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className={styles.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>
      <div className={styles.tabContent} role="tabpanel">
        {children}
      </div>
    </div>
  );
}
