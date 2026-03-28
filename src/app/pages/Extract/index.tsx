import { useState, useEffect } from "react";
import { Select, Typography, Button, Card, Badge } from "@/components/atoms";
import { FileBrowser, TrackSelector } from "@/components/organisms";
import { SplitPageLayout } from "@/components/templates/SplitPageLayout";
import { useFolders, useVideo, useToast } from "@/hooks";
import styles from "./Extract.module.css";
import type { SubtitleTrack } from "@/types";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

export default function Extract() {
    const [currentPath, setCurrentPath] = useState<string>("/");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
    const { t } = useTranslation();

    const [extractButtonState, setExtractButtonState] = useState<{ variant: "primary" | "success" | "error", label: string }>({ variant: "primary", label: t('pages.extract.extractTrackInitial') });

    const toast = useToast();
    const { folders, exploreFolder } = useFolders();
    const { getTracks, extractTrack } = useVideo();

    const { data: exploreEntries } = exploreFolder(currentPath);

    const handleSelectTrack = (track: SubtitleTrack) => {
        setSelectedTrackIndex(track.id);
        setExtractButtonState({ variant: "primary", label: t('pages.extract.extractTrack', { id: track.id, language: track.language || t('pages.extract.unknown') }) });
    }

    const { data: tracksData, isFetching: isLoadingTracks, isError: isTracksError } = getTracks(selectedFile);

    useEffect(() => {
        setSelectedTrackIndex(null);
        if (isTracksError) {
            toast.warning(t('components.table.errorLoadingTracks'));
        }
    }, [selectedFile, isTracksError, toast, t]);

    const handleChangeFavoriteFolder = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPath = event.target.value;
        if (newPath) {
            setCurrentPath(newPath);
            setSelectedFile(null);
        }
    }

    const handleNavigate = (newPath: string) => {
        setCurrentPath(newPath);
        setSelectedFile(null);
    };

    const onPathSubmit = (manualPath: string) => {
        setCurrentPath(manualPath);
        setSelectedFile(null);
    }

    const handleExtract = () => {
        if (!selectedFile || selectedTrackIndex === null) return;

        extractTrack.mutate(
            { videoPath: selectedFile, subtitleId: selectedTrackIndex },
            {
                onSuccess: ({ srtPath }) => {
                    toast.success(t('pages.extract.extractTrackSuccess', { srtPath }));
                    setSelectedTrackIndex(null);
                    setExtractButtonState({ variant: "success", label: t('pages.extract.extractTrackSuccess', { srtPath }) });
                },
                onError: () => {
                    toast.error(t('pages.extract.errorExtractingTrack'));
                    setExtractButtonState({ variant: "error", label: t('pages.extract.errorExtractingTrack') });
                }
            }
        );
    };

    const isFavorite = folders.some(f => f.path === currentPath);

    const renderLeft = () => (
        <Card variant="primary" className={styles.fullHeightCard}>
            <Card.Header>
                <Typography variant="h3" as="p">{t('pages.extract.selectFile')}</Typography>
            </Card.Header>
            <Card.Content className={styles.scrollableContent}>
                <div className={styles.selectWrapper}>
                    <Select
                        placeholder={t('pages.extract.selectFavoriteFolder')}
                        onChange={handleChangeFavoriteFolder}
                        value={isFavorite ? currentPath : ""}
                        options={folders.map(folder => ({
                            value: folder.path,
                            label: `${folder.alias} (${folder.path})`
                        }))}
                    />
                </div>
                <FileBrowser
                    currentPath={currentPath}
                    items={exploreEntries || []}
                    onNavigate={handleNavigate}
                    onPathSubmit={onPathSubmit}
                    showFavorites={true}
                    fileFilter="video"
                    selectedFile={selectedFile}
                    onSelectFile={setSelectedFile}
                />
            </Card.Content>
        </Card>
    );

    const renderRight = () => {
        if (!selectedFile) {
            return (
                <div className={styles.emptyState}>
                    <Typography variant="muted">{t('pages.extract.selectVideo')}</Typography>
                </div>
            );
        }

        return (
            <Card variant="secondary" className={styles.fullHeightCard}>
                <Card.Header>
                    <Typography variant="h3" as="p">{t('pages.extract.selectSubtitleTrack')}</Typography>
                </Card.Header>
                <Card.Content className={styles.scrollableContent}>
                    {isLoadingTracks ? (
                        <div className={styles.loadingState}>
                            <Typography variant="muted">{t('pages.extract.loadingTracks')}</Typography>
                        </div>
                    ) : (
                        <TrackSelector
                            tracks={tracksData?.tracks || []}
                            selectedTrackIndex={selectedTrackIndex}
                            onSelectTrack={handleSelectTrack}
                        />
                    )}
                </Card.Content>
            </Card>
        );
    };

    const renderFooter = () => (
        <div className={clsx(styles.footer, { [styles.footerCentered]: selectedFile })}>
            {selectedFile && (
                <div className={styles.selectedInfo}>
                    <Typography className={styles.truncateText} variant="muted">
                        <Typography variant="span" color="primary">{t('pages.extract.file')}</Typography> {selectedFile}
                    </Typography>
                    {selectedTrackIndex !== null && (
                        <div className={styles.selectedTrackInfo}>
                            <Typography variant="muted" color="secondary">{t('pages.extract.track')}</Typography>
                            <div className={styles.selectedTrackInfo}>
                                <Typography variant="muted">
                                    ID # {selectedTrackIndex} - {tracksData?.tracks.find(t => t.id === selectedTrackIndex)?.language || t('pages.extract.unknown')}
                                </Typography>
                                <Badge variant="secondary">
                                    {tracksData?.tracks.find(t => t.id === selectedTrackIndex)?.codec}
                                </Badge>
                                <Typography variant="muted">
                                    {tracksData?.tracks.find(t => t.id === selectedTrackIndex)?.name}
                                </Typography>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <Button
                onClick={handleExtract}
                disabled={selectedTrackIndex === null || extractTrack.isPending}
                loading={extractTrack.isPending}
                variant={extractButtonState.variant}
            >
                {extractButtonState.label}
            </Button>
        </div>
    );

    return (
        <SplitPageLayout
            titleKey="pages.extract.title"
            leftContent={renderLeft()}
            rightContent={renderRight()}
            footerContent={renderFooter()}
        />
    );
}