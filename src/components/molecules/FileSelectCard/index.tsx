import { useState, useEffect } from 'react';
import { Card, Select, Typography } from '@/components/atoms';
import { FileBrowser } from '@/components/organisms';
import { useFolders } from '@/hooks/api/useFolders';
import { useTranslation } from 'react-i18next';
import styles from './FileSelectCard.module.css';

export interface FileSelectCardProps {
  title: string;
  fileFilter: 'video' | 'subtitle' | 'all';
  selectedFile: string | null;
  onSelectFile: (path: string | null) => void;
  variant?: 'primary' | 'secondary';
}

export function FileSelectCard({
  title,
  fileFilter,
  selectedFile,
  onSelectFile,
  variant = 'primary',
}: FileSelectCardProps) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const { folders, exploreFolder, getRoots } = useFolders();

  // Initialize to the first root once loaded
  useEffect(() => {
    if (!currentPath && getRoots.data && getRoots.data.length > 0) {
      setCurrentPath(getRoots.data[0].path);
    }
  }, [getRoots.data, currentPath]);

  const { data: exploreData } = exploreFolder(currentPath);
  const exploreEntries = exploreData?.items ?? [];
  const parentPath = exploreData?.parentPath ?? null;
  const folderName = exploreData?.folderName ?? '';

  const isFavorite = folders.some(f => f.path === currentPath);

  const handleNavigate = (newPath: string) => {
    setCurrentPath(newPath);
    onSelectFile(null);
  };

  const handlePathSubmit = (manualPath: string) => {
    setCurrentPath(manualPath);
    onSelectFile(null);
  };

  const handleChangeFavoriteFolder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPath = e.target.value;
    if (newPath) {
      setCurrentPath(newPath);
      onSelectFile(null);
    }
  };

  return (
    <Card variant={variant} className={styles.fullHeightCard}>
      <Card.Header>
        <Typography variant="h3" as="p">{title}</Typography>
      </Card.Header>
      <Card.Content className={styles.scrollableContent}>
        <div className={styles.selectWrapper}>
          <Select
            placeholder={t('components.fileSelectCard.selectFavoriteFolder')}
            onChange={handleChangeFavoriteFolder}
            value={isFavorite ? currentPath ?? '' : ''}
            options={folders.map(folder => ({
              value: folder.path,
              label: `${folder.alias} (${folder.path})`,
            }))}
          />
        </div>
        <FileBrowser
          currentPath={currentPath ?? ''}
          parentPath={parentPath}
          folderName={folderName}
          items={exploreEntries}
          onNavigate={handleNavigate}
          onPathSubmit={handlePathSubmit}
          showFavorites={true}
          fileFilter={fileFilter}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      </Card.Content>
    </Card>
  );
}
