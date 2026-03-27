import { useState, useEffect } from "react";
import { PageTitle, Select, Typography, Button } from "@/components/atoms";
import { FileBrowser } from "@/components/organisms/FileBrowser";
import { TrackSelector } from "@/components/organisms/TrackSelector";
import { useFolders } from "@/hooks/api/useFolders";
import { useVideo } from "@/hooks/api/useVideo";
import { useToast } from "@/hooks/useToast";
import { Card } from "@/components/atoms/Card";
import styles from "./Extract.module.css";
import type { SubtitleTrack } from "@/types";
import { useTranslation } from "react-i18next";

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

    const {
        data: tracksData,
        isFetching: isLoadingTracks,
        isError: isTracksError
    } = getTracks(selectedFile);

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
                onError: (error) => {
                    toast.error(t('pages.extract.errorExtractingTrack'));
                    setExtractButtonState({ variant: "error", label: t('pages.extract.errorExtractingTrack') });
                }
            }
        );
    };

    const isFavorite = folders.some(f => f.path === currentPath);

    return (
        <div className={styles.pageContainer}>
            <PageTitle titleKey="pages.extract.title" />

            <div className={styles.splitLayout}>
                <div className={styles.leftColumn}>
                    <Card variant="primary" className={styles.fullHeightCard}>
                        <Card.Header>
                            <Typography variant="h3" as="p">
                                {t('pages.extract.title')}
                            </Typography>
                        </Card.Header>

                        <Card.Content className={styles.scrollableContent}>
                            <div className={styles.selectWrapper}>
                                <Select
                                    placeholder={t('pages.extract.selectFavoriteFolder', 'Selecione uma pasta favorita...')}
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
                </div>

                <div className={styles.rightColumn}>
                    {selectedFile ? (
                        <Card variant="secondary" className={styles.fullHeightCard}>
                            <Card.Header className={styles.actionFooter}>
                                <Typography variant="h3" as="p">
                                    {t('pages.extract.selectSubtitleTrack', 'Selecione a Trilha de Legenda')}
                                </Typography>
                                <Button
                                    onClick={handleExtract}
                                    disabled={selectedTrackIndex === null || extractTrack.isPending}
                                    loading={extractTrack.isPending}
                                    variant={extractButtonState.variant}
                                >
                                    {extractButtonState.label}
                                </Button>
                            </Card.Header>

                            <Card.Content className={styles.scrollableContent}>
                                {isLoadingTracks ? (
                                    <div className={styles.loadingState}>
                                        <Typography variant="muted">{t('pages.extract.loadingTracks')}</Typography>
                                    </div>
                                ) : (
                                    <>
                                        <TrackSelector
                                            tracks={tracksData?.tracks || []}
                                            selectedTrackIndex={selectedTrackIndex}
                                            onSelectTrack={handleSelectTrack}
                                        />
                                    </>
                                )}
                            </Card.Content>
                        </Card>
                    ) : (
                        <div className={styles.emptyState}>
                            <Typography variant="muted">
                                {t('pages.extract.selectVideo')}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}