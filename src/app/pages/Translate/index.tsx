import { useState, useEffect, useCallback } from "react";
import { Select, Typography, Card, Input, Button } from "@/components/atoms";
import { Textarea } from "@/components/atoms";
import { FileBrowser } from "@/components/organisms";
import { SplitPageLayout } from "@/components/templates/SplitPageLayout";
import { useFolders, useTMDB, useToast } from "@/hooks";
import styles from "./Translate.module.css";
import { useTranslation } from "react-i18next";
import { AsyncSearch } from "@/components/molecules";
import { ImagePlaceholder } from "@/components/atoms/ImagePlaceholder";
import type { TMDBResult } from "@/types";

import { parseMediaFilename } from "@/lib/mediaParser";
import clsx from "clsx";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

export default function TranslatePage() {
    const { t } = useTranslation();
    const toast = useToast();

    const [currentPath, setCurrentPath] = useState<string>("/");
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [season, setSeason] = useState("");
    const [episode, setEpisode] = useState("");

    const [selectedMedia, setSelectedMedia] = useState<TMDBResult | null>(null);
    const [episodeData, setEpisodeData] = useState<any>(null);

    const { folders, exploreFolder } = useFolders();
    const { data: exploreEntries } = exploreFolder(currentPath);
    const { searchMedia, getEpisode } = useTMDB();

    const handleSearch = useCallback((query: string) => {
        searchMedia.mutate({ query });
    }, [searchMedia.mutate]);

    useEffect(() => {
        if (selectedFile) {
            const parsed = parseMediaFilename(selectedFile);

            setSearchQuery(parsed.title);
            setSeason(parsed.season || "");
            setEpisode(parsed.episode || "");
            setSelectedMedia(null);
            setEpisodeData(null);

            if (parsed.title) {
                searchMedia.mutate({ query: parsed.title }, {
                    onSuccess: (data) => {
                        if (data.results && data.results.length > 0) {
                            const firstMatch = data.results[0];
                            setSelectedMedia(firstMatch);
                            setSearchQuery(firstMatch.name || firstMatch.title || "");
                            toast.success(`"${firstMatch.name || firstMatch.title}" vinculado!`);
                        }
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile]);

    useEffect(() => {
        const isTV = selectedMedia?.media_type === 'tv' || !!selectedMedia?.name;
        if (selectedMedia && isTV && season && episode) {
            getEpisode.mutate({
                showId: selectedMedia.id,
                season: Number(season),
                episode: Number(episode)
            }, {
                onSuccess: (data) => setEpisodeData(data),
            });
        }
    }, [selectedMedia, season, episode, getEpisode.mutate]);

    const handleSelectMedia = (media: TMDBResult) => {
        setSelectedMedia(media);
        setSearchQuery(media.name || media.title || "");
    };

    const renderLeft = () => (
        <Card variant="primary" className={styles.fullHeightCard}>
            <Card.Header>
                <Typography variant="h3" as="p">{t('pages.translate.selectFile')}</Typography>
            </Card.Header>
            <Card.Content className={styles.scrollableContent}>
                <div className={styles.selectWrapper}>
                    <Select
                        placeholder={t('pages.extract.selectFavoriteFolder')}
                        onChange={(e) => { setCurrentPath(e.target.value); setSelectedFile(null); }}
                        value={folders.some(f => f.path === currentPath) ? currentPath : ""}
                        options={folders.map(f => ({ value: f.path, label: `${f.alias} (${f.path})` }))}
                    />
                </div>
                <FileBrowser
                    currentPath={currentPath}
                    items={exploreEntries || []}
                    onNavigate={(path) => { setCurrentPath(path); setSelectedFile(null); }}
                    fileFilter="subtitle"
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
                    <Typography variant="muted">Selecione uma legenda ao lado para analisar.</Typography>
                </div>
            );
        }

        return (
            <Card variant="secondary" className={styles.fullHeightCard}>
                <Card.Header>
                    <Typography variant="h3" as="p">Editor de Metadados</Typography>
                </Card.Header>
                <Card.Description>
                    <Typography variant="muted">
                        Aqui você pode revisar e ajustar os metadados vinculados à legenda selecionada antes de iniciar a tradução. Adicionar metadados pode ajudar a melhorar a precisão da tradução, especialmente para gírias, expressões regionais ou termos técnicos específicos da mídia.
                    </Typography>
                </Card.Description>

                <Card.Content className={styles.scrollableContent}>
                    <div className={clsx(styles.searchContainer, selectedMedia?.media_type === 'tv' && styles.searchContainerTV)}>
                        <AsyncSearch<TMDBResult>
                            label="Pesquisar mídia no TMDB"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={handleSearch}
                            isLoading={searchMedia.isPending}
                            results={searchMedia.data?.results || []}
                            onSelect={handleSelectMedia}
                            keyExtractor={(item) => item.id}
                            fullWidth
                            renderResult={(item) => (
                                <div className={styles.searchResultItem}>
                                    <img
                                        src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}w92${item.poster_path}` : ''}
                                        className={styles.searchResultPoster}
                                        alt=""
                                    />
                                    <div className={styles.searchResultInfo}>
                                        <span className={styles.searchResultTitle}>{item.name || item.title}</span>
                                        <span className={styles.searchResultMeta}>
                                            {item.media_type === 'tv' ? 'Série' : 'Filme'} • {(item.first_air_date || item.release_date)?.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                            )}
                        />

                        {selectedMedia?.media_type === 'tv' && (
                            <div className={styles.shortInputsRow}>
                                <Input label="Temporada" value={season} onChange={(e) => setSeason(e.target.value)} type="number" fullWidth />
                                <Input label="Episódio" value={episode} onChange={(e) => setEpisode(e.target.value)} type="number" fullWidth />
                            </div>
                        )}
                    </div>
                    <div className={styles.editorContainer}>
                        <div className={styles.mediaCard}>
                            <div className={styles.mediaBackdrop} style={{ backgroundImage: `url(${selectedMedia?.backdrop_path ? `${TMDB_IMAGE_BASE_URL}w500${selectedMedia.backdrop_path}` : ''})` }}></div>
                            <div className={styles.visuals}>
                                {selectedMedia?.poster_path ? (
                                    <img src={`${TMDB_IMAGE_BASE_URL}w500${selectedMedia.poster_path}`} className={styles.posterImage} alt="Poster" />
                                ) : (
                                    <ImagePlaceholder aspectRatio="poster" className={styles.posterImage} />
                                )}
                            </div>
                            <div className={styles.mediaInfo}>
                                <Typography variant="h2" as="h1" className={styles.mediaTitle}>
                                    {selectedMedia?.name || selectedMedia?.title || "Título Desconecido"}
                                </Typography>
                                <Typography variant="muted" className={styles.mediaMeta}>
                                    {selectedMedia?.media_type === 'tv' ? 'Série' : 'Filme'} • {(selectedMedia?.first_air_date || selectedMedia?.release_date)?.split('-')[0]}
                                </Typography>
                                <Typography variant="body" className={styles.mediaOverview}>
                                    {selectedMedia?.overview || "Sinopse não disponível."}
                                </Typography>
                            </div>
                        </div>

                        {(selectedMedia?.media_type === 'tv' || !selectedMedia) && (
                            <div className={styles.mediaCard}>
                                <div className={styles.visuals}>
                                    {episodeData?.still_path ? (
                                        <img src={`${TMDB_IMAGE_BASE_URL}w300${episodeData.still_path}`} className={styles.stillImage} alt="Cena" />
                                    ) : (
                                        <ImagePlaceholder aspectRatio="still" className={styles.stillImage} />
                                    )}
                                </div>
                                <div className={styles.mediaInfo}>
                                    <Typography variant="h3" as="h2" className={styles.mediaTitle}>
                                        {episodeData ? `S${String(episodeData.season_number).padStart(2, '0')}E${String(episodeData.episode_number).padStart(2, '0')} - ${episodeData.name}` : "Selecione a temporada e episódio"}
                                    </Typography>
                                    <Typography variant="muted" className={styles.mediaMeta}>
                                        {episodeData ? `Série • ${episodeData.air_date?.split('-')[0]}` : "Informações do episódio não disponíveis"}
                                    </Typography>
                                    <Typography variant="body" className={styles.mediaOverview}>
                                        {episodeData?.overview || "Sinopse do episódio não disponível."}
                                    </Typography>
                                </div>
                            </div>
                        )}

                        <div className={styles.metadataEditor}>
                            <div className={styles.customMetadataSection}>
                                <div>
                                    <Typography variant="h3" as="p">Metadados Personalizados</Typography>
                                    <Typography variant="muted" className={styles.customMetadataDescription}>
                                        Adicione quaisquer metadados personalizados que possam ajudar a melhorar a tradução. Isso pode incluir informações como gírias específicas, termos técnicos ou expressões regionais que são relevantes para a mídia em questão.
                                    </Typography>
                                </div>
                                <Textarea placeholder="Ex: 'O protagonista é um hacker especializado em segurança cibernética.'" fullWidth rows={4} />
                            </div>
                             <div className={styles.modelAndOptionsSection}>
                                <div>
                                    <Typography variant="h3" as="p">Metadados Personalizados</Typography>
                                    <Typography variant="muted" className={styles.customMetadataDescription}>
                                        Adicione quaisquer metadados personalizados que possam ajudar a melhorar a tradução. Isso pode incluir informações como gírias específicas, termos técnicos ou expressões regionais que são relevantes para a mídia em questão.
                                    </Typography>
                                </div>
                                <Textarea placeholder="Ex: 'O protagonista é um hacker especializado em segurança cibernética.'" fullWidth rows={4} />
                            </div>
                        </div>
                    </div>


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
                </div>
            )}
            <Button
                variant="primary"
            >
                Pew
            </Button>
        </div>
    );


    return (
        <SplitPageLayout
            titleKey="pages.translate.title"
            leftContent={renderLeft()}
            rightContent={renderRight()}
            footerContent={renderFooter()}
        />
    );
}