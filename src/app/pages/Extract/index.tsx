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

export default function Extract() {
    const [currentPath, setCurrentPath] = useState<string>("/");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
    const [extractButtonState, setExtractButtonState] = useState<{ variant: "primary" | "success" | "error", label: string }>({ variant: "primary", label: "Extrair" });

    const toast = useToast();
    const { folders, exploreFolder } = useFolders();
    const { getTracks, extractTrack } = useVideo();

    const { data: exploreEntries } = exploreFolder(currentPath);

    const handleSelectTrack = (track: SubtitleTrack) => {
        setSelectedTrackIndex(track.id);
        setExtractButtonState({ variant: "primary", label: `Extrair Trilha ${track.id} (${track.language || 'Unknown'})` });
    }

    const {
        data: tracksData,
        isFetching: isLoadingTracks,
        isError: isTracksError
    } = getTracks(selectedFile);

    useEffect(() => {
        setSelectedTrackIndex(null);
        if (isTracksError) {
            toast.warning("Não foi possível ler as legendas deste arquivo.");
        }
    }, [selectedFile, isTracksError, toast]);

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
                    toast.success(`Legenda extraída com sucesso! Arquivo salvo em: ${srtPath}`);
                    setSelectedTrackIndex(null);
                    setExtractButtonState({ variant: "success", label: `Extraído para: ${srtPath}` });

                },
                onError: (error) => {
                    toast.error("Erro ao extrair a trilha: " + error.message);
                    setExtractButtonState({ variant: "error", label: "Erro" });
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
                                Selecione o arquivo de vídeo
                            </Typography>
                        </Card.Header>

                        <Card.Content className={styles.scrollableContent}>
                            <div className={styles.selectWrapper}>
                                <Select
                                    placeholder="Selecione uma pasta favorita..."
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

                {/* LADO DIREITO: TRILHAS DE LEGENDA */}
                <div className={styles.rightColumn}>
                    {selectedFile ? (
                        <Card variant="secondary" className={styles.fullHeightCard}>
                            <Card.Header className={styles.actionFooter}>
                                <Typography variant="h3" as="p">
                                    Selecione a Trilha de Legenda
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
                                        <Typography variant="muted">Analisando o arquivo com FFmpeg... não seja impaciente!</Typography>
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
                                Selecione um vídeo ao lado para ver as trilhas disponíveis.
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}