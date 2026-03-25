import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './FileBrowser.module.css';
import { useTranslation } from 'node_modules/react-i18next';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface FileBrowserProps {
  currentPath: string;
  items: FileNode[];
  onNavigate: (newPath: string) => void;
  onPathSubmit?: (manualPath: string) => void;
  className?: string;
}

export function FileBrowser({ currentPath, items, onNavigate, onPathSubmit, className }: FileBrowserProps) {
  const [localPath, setLocalPath] = useState(currentPath);

  const { t } = useTranslation();

  useEffect(() => {
    setLocalPath(currentPath);
  }, [currentPath]);

  const handleGoUp = () => {
    const parts = currentPath.split(/[/\\]/).filter(Boolean);
    parts.pop();
    const newPath = currentPath.startsWith('/') ? '/' + parts.join('/') : parts.join('\\');
    onNavigate(newPath || '/');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onPathSubmit) {
      onPathSubmit(localPath);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <button 
          className={styles.upButton} 
          onClick={handleGoUp}
          disabled={currentPath === '/' || currentPath === '' || currentPath.match(/^[A-Z]:\\$/i) !== null}
          title={t('components.fileBrowser.up')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <input 
          className={styles.pathInput}
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>

      <ul className={styles.list}>
        {items.length === 0 ? (
          <li className={styles.listItem} style={{ color: 'var(--text-muted)', justifyContent: 'center' }}>
            {t('components.fileBrowser.empty')}
          </li>
        ) : (
          items.map((item) => (
            <li 
              key={item.path} 
              className={styles.listItem}
              onClick={() => item.isDirectory && onNavigate(item.path)}
            >
              <span className={clsx(styles.icon, item.isDirectory && styles.folderIcon)}>
                {item.isDirectory ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                )}
              </span>
              <span>{item.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}