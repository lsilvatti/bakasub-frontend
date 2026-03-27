import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import styles from './FileBrowser.module.css';
import { useTranslation } from 'react-i18next';
import type { FileNode } from '@/types/api';
// Você vai precisar dos seus hooks de volta!
import { useFolders } from '@/hooks/api/useFolders';
import { useToast } from '@/hooks/useToast';

export interface FileBrowserProps {
  currentPath: string;
  items: FileNode[];
  onNavigate: (newPath: string) => void;
  onPathSubmit?: (manualPath: string) => void;
  
  // Novas props para seleção e filtro!
  onSelectFile?: (path: string) => void;
  selectedFile?: string | null;
  fileFilter?: 'video' | 'subtitle' | 'all';
  showFavorites?: boolean;
  className?: string;
}

// Extensões hardcoded porque seu backend não manda o tipo. Agradeça depois.
const VIDEO_EXTS = ['.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv'];
const SUB_EXTS = ['.srt', '.ass', '.vtt', '.ssa', '.sub'];

export function FileBrowser({ 
  currentPath, 
  items, 
  onNavigate, 
  onPathSubmit, 
  onSelectFile,
  selectedFile,
  fileFilter = 'all',
  showFavorites = false,
  className 
}: FileBrowserProps) {
  const [localPath, setLocalPath] = useState(currentPath);
  const { t } = useTranslation();
  const toast = useToast();

  // Hooks de favoritos que você tinha esquecido
  const { folders, addFolder, removeFolder, isLoadingFolders } = useFolders();

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

  // Identificador de tipo de arquivo
  const getFileType = (filename: string) => {
    const ext = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    if (VIDEO_EXTS.includes(`.${ext}`)) return 'video';
    if (SUB_EXTS.includes(`.${ext}`)) return 'subtitle';
    return 'other';
  };

  // Filtra a lista de itens baseada na prop fileFilter
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.isDirectory) return true; // Sempre exibe pastas
      if (fileFilter === 'all') return true;
      const type = getFileType(item.name);
      return type === fileFilter;
    });
  }, [items, fileFilter]);

  // Lógica da Estrela de Favorito
  const currentFavorite = folders?.find(f => f.path === currentPath);
  const isFavorite = !!currentFavorite;

  const handleToggleFavorite = () => {
    if (!currentPath || currentPath === '/') return;

    if (isFavorite) {
      removeFolder.mutate(currentFavorite.id, {
        onSuccess: () => toast.success(t('components.fileBrowser.removeFavorite', 'Removido dos favoritos'))
      });
    } else {
      const parts = currentPath.split(/[/\\]/).filter(Boolean);
      const alias = parts.length > 0 ? parts[parts.length - 1] : currentPath;

      addFolder.mutate({ alias, path: currentPath }, {
        onSuccess: () => toast.success(t('components.fileBrowser.saveFavorite', 'Salvo nos favoritos!'))
      });
    }
  };

  const renderIcon = (item: FileNode) => {
    if (item.isDirectory) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={styles.folderIcon}>
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
      );
    }

    const type = getFileType(item.name);
    
    if (type === 'video') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.videoIcon}>
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
      );
    }

    if (type === 'subtitle') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.subtitleIcon}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="12" y1="14" x2="12" y2="14"></line>
        </svg>
      );
    }

    // Arquivo genérico
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    );
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <button 
          className={styles.upButton} 
          onClick={handleGoUp}
          disabled={currentPath === '/' || currentPath === '' || currentPath.match(/^[A-Z]:\\$/i) !== null}
          title={t('components.fileBrowser.up', 'Subir um nível')}
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

        {showFavorites && (
          <button
            className={clsx(styles.starButton, isFavorite && styles.activeStar)}
            onClick={handleToggleFavorite}
            disabled={!currentPath || currentPath === '/' || isLoadingFolders}
            title={isFavorite ? t('components.fileBrowser.unfav', 'Remover dos Favoritos') : t('components.fileBrowser.fav', 'Salvar nos Favoritos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        )}
      </div>

      <ul className={styles.list}>
        {filteredItems.length === 0 ? (
          <li className={styles.listItem} style={{ color: 'var(--color-text-muted)', justifyContent: 'center' }}>
            {t('components.fileBrowser.empty', 'Nenhum item encontrado')}
          </li>
        ) : (
          filteredItems.map((item) => {
            const isSelected = item.path === selectedFile && !item.isDirectory;

            return (
              <li 
                key={item.path} 
                className={clsx(
                  styles.listItem, 
                  !item.isDirectory && styles.fileItem,
                  isSelected && styles.selectedItem
                )}
                onClick={() => {
                  if (item.isDirectory) {
                    onNavigate(item.path);
                  } else if (onSelectFile) {
                    onSelectFile(item.path);
                  }
                }}
              >
                <span className={styles.icon}>
                  {renderIcon(item)}
                </span>
                <span className={styles.itemName} title={item.name}>{item.name}</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}