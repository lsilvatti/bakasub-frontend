import React from 'react';
import clsx from 'clsx';
import styles from './FileViewer.module.css';
import { useTranslation } from 'react-i18next';

export interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'subtitle';
  size?: string;
  info?: string;
}

export interface FileViewerProps {
  files: MediaFile[];
  selectedIds: string[];
  onToggleSelect: (id: string, isMulti: boolean) => void;
  multiSelect?: boolean;
  className?: string;
}

export function FileViewer({ files, selectedIds, onToggleSelect, multiSelect = true, className }: FileViewerProps) {
  const { t } = useTranslation();
  
  const handleCardClick = (_e: React.MouseEvent, id: string) => {
    onToggleSelect(id, multiSelect);
  };

  if (files.length === 0) {
    return (
      <div className={clsx(styles.grid, className)} style={{ display: 'block', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        {t('components.fileViewer.noFiles')}
      </div>
    );
  }

  return (
    <div className={clsx(styles.grid, className)}>
      {files.map((file) => {
        const isSelected = selectedIds.includes(file.id);

        return (
          <div 
            key={file.id} 
            className={clsx(styles.card, isSelected && styles.selected)}
            onClick={(e) => handleCardClick(e, file.id)}
          >
            <div className={styles.selectionIndicator}>
              <svg className={styles.checkIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <div className={clsx(styles.iconWrapper, styles[file.type])}>
              {file.type === 'video' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
              )}
            </div>

            <span className={styles.fileName} title={file.name}>
              {file.name}
            </span>

            {(file.size || file.info) && (
              <div className={styles.fileMeta}>
                {file.info && <span>{file.info}</span>}
                {file.info && file.size && <span> • </span>}
                {file.size && <span>{file.size}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}