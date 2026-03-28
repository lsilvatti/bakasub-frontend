import { type ReactNode } from 'react';
import clsx from 'clsx';
import { PageTitle } from '@/components/atoms';
import styles from './SplitPageLayout.module.css';
import type { ParseKeys } from 'node_modules/i18next/typescript/t';

export interface SplitPageLayoutProps {
  titleKey: ParseKeys;
  leftContent: ReactNode;
  rightContent: ReactNode;
  footerContent?: ReactNode;
  footerCentered?: boolean;
}

export const SplitPageLayout = ({
  titleKey,
  leftContent,
  rightContent,
  footerContent,
  footerCentered = false,
}: SplitPageLayoutProps) => {
  return (
    <div className={styles.pageContainer}>
      <PageTitle titleKey={titleKey as ParseKeys} />

      <div className={styles.splitLayout}>
        {/* Coluna da Esquerda */}
        <div className={styles.leftColumn}>
          {leftContent}
        </div>

        {/* Coluna da Direita */}
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