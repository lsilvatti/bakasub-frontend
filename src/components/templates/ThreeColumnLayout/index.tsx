import { type ReactNode } from 'react';
import clsx from 'clsx';
import { PageTitle } from '@/components/atoms';
import styles from './ThreeColumnLayout.module.css';
import type { ParseKeys } from 'node_modules/i18next/typescript/t';

export interface ThreeColumnLayoutProps {
  titleKey: ParseKeys;
  columns: ReactNode[];
  footerContent?: ReactNode;
}

export const ThreeColumnLayout = ({
  titleKey,
  columns,
  footerContent,
}: ThreeColumnLayoutProps) => {
  return (
    <div className={styles.pageContainer}>
      <PageTitle titleKey={titleKey as ParseKeys} />

      <div className={styles.threeColumnLayout}>
        <div className={styles.leftColumn}>
          {columns[0]}
        </div>

        <div className={styles.centerColumn}>
            {columns[1]}
        </div>

        <div className={styles.rightColumn}>
          {columns[2]}
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