import { type ReactNode } from 'react';
import clsx from 'clsx';
import { PageTitle } from '@/components/atoms';
import styles from './SplitPageLayout.module.css';
import type { ParseKeys } from 'node_modules/i18next/typescript/t';

export interface TreeRowLayoutProps {
  titleKey: ParseKeys;
rowContent: ReactNode[];
  footerContent?: ReactNode;
}

export const TreeRowLayout = ({
  titleKey,
  rowContent,
  footerContent,
}: TreeRowLayoutProps) => {
  return (
    <div className={styles.pageContainer}>
      <PageTitle titleKey={titleKey as ParseKeys} />

      <div className={styles.splitLayout}>
        <div className={styles.leftColumn}>
          {rowContent[0]}
        </div>

        <div className={styles.centerColumn}>
            {rowContent[1]}
        </div>

        <div className={styles.rightColumn}>
          {rowContent[2]}
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