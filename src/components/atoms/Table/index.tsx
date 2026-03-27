import { type ReactNode } from 'react';
import styles from './Table.module.css';
import { Typography, Button } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

interface TableProps {
  children: ReactNode;
  density?: 'compact' | 'normal';
}

export const Table = ({ children, density = 'normal' }: TableProps) => (
  <div className={styles.tableContainer} data-density={density}>
    <div className={styles.tableArea}>
      <table className={styles.table}>{children}</table>
    </div>
  </div>
);

Table.Header = ({ children }: { children: ReactNode }) => (
  <thead className={styles.thead}><tr>{children}</tr></thead>
);

Table.Column = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <th className={styles.th} {...props}>{children}</th>
);

Table.Body = ({ children }: { children: ReactNode }) => (
  <tbody className={styles.tbody}>{children}</tbody>
);

Table.Row = ({ children, className, ...props }: { children: ReactNode; className?: string; [key: string]: any }) => (
  <tr 
    className={clsx(styles.tr, className)} 
    {...props}
  >
    {children}
  </tr>
);
Table.Cell = ({ children }: { children: ReactNode }) => (
  <td className={styles.td}>{children}</td>
);

Table.LimitSelector = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const { t } = useTranslation();

  return (
      <div className={styles.limitSelector}>
        <Typography variant="small" color="secondary">{t('components.table.limitLabel', 'Mostrar:')}</Typography>
        <select
          className={styles.selectNative}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
  )
}

interface ExpandableRowProps {
  mainContent: ReactNode;
  expandedContent: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

Table.ExpandableRow = ({ mainContent, expandedContent, isExpanded, onToggle }: ExpandableRowProps) => (
  <>
    <tr className={`${styles.tr} ${styles.trHover}`} onClick={onToggle}>
      {mainContent}
      <td className={styles.td} style={{ width: '40px', textAlign: 'center' }}>
        <span className={styles.chevron} data-expanded={isExpanded}>▼</span>
      </td>
    </tr>
    {isExpanded && (
      <tr className={styles.expandedRow}>
        <td colSpan={100} className={styles.expandedCell}>
          <div className={styles.expandedContentWrapper}>
            {expandedContent}
          </div>
        </td>
      </tr>
    )}
  </>
);

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  currentCount: number;
  limit: number; 
  isFetching: boolean;
  onPageChange: (p: number) => void;
}

Table.Pagination = ({ page, totalPages, totalItems, currentCount, limit, isFetching, onPageChange }: PaginationProps) => {
  const { t } = useTranslation();

  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const end = totalItems === 0 ? 0 : start + currentCount - 1; 

  return (
    <div className={styles.pagination}>
      <Typography variant="small" color="secondary">
        {t('components.table.showing', { 
          start, 
          end, 
          total: totalItems 
        })} 
        {isFetching && ` (${t('components.table.syncing')})`}
      </Typography>
      <div className={styles.pageControls}>
        <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page === 1}>{t('components.table.previous', 'Anterior')}</Button>
        <div className={styles.pageIndicator}>{page} / {totalPages}</div>
        <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>{t('components.table.next', 'Próxima')}</Button>
      </div>
    </div>
  );
}