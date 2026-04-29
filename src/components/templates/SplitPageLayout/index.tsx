import { type ReactNode } from 'react';
import type { ParseKeys } from 'i18next';
import clsx from 'clsx';
import { PageTitle } from '@/components/atoms';
import styles from './SplitPageLayout.module.css';

export interface SplitPageLayoutProps {
  titleKey: ParseKeys;
  leftContent: ReactNode;
  rightContent: ReactNode;
  footerContent?: ReactNode;
  layoutClassName?: string;
  variant?: 'default' | 'half';
}

export const SplitPageLayout = ({
  titleKey,
  leftContent,
  rightContent,
  footerContent,
  layoutClassName,
  variant = 'default',
}: SplitPageLayoutProps) => {
  return (
    <div className={clsx(styles.pageContainer)}>
      <PageTitle titleKey={titleKey as ParseKeys} />

      <div className={clsx(styles.splitLayout, variant === 'half' && styles.halfLayout, layoutClassName)}>
        <div className={styles.leftColumn}>
          {leftContent}
        </div>

        <div className={styles.rightColumn}>
          {rightContent}
        </div>
      </div>

      {footerContent && (
        <footer className={clsx(styles.footer)}>
          {footerContent}
        </footer>
      )}
    </div>
  );
};