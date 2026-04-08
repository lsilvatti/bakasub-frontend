import { useState, useEffect, useCallback, useRef } from "react";
import { Select, Typography, Card, Input, Button, Checkbox, Badge } from "@/components/atoms";
import { Textarea } from "@/components/atoms";
import { FileBrowser, TranslationJobDialog } from "@/components/organisms";
import { SplitPageLayout } from "@/components/templates/SplitPageLayout";
import { useFolders, useTMDB, useToast, usePresets, useLanguages, useTranslate, useConfig, useOpenRouter, useGlobalSSE } from "@/hooks";
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

    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [removeSDH, setRemoveSDH] = useState<boolean>(false);
    const [context, setContext] = useState<string>("");

    const [jobDialogOpen, setJobDialogOpen] = useState(false);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [activeOutputPath, setActiveOutputPath] = useState<string | undefined>();
    const [isJobRunning, setIsJobRunning] = useState(false);

    const [translateButtonState, setTranslateButtonState] = useState<{
        variant: "primary" | "success" | "error";
        label: string;
    }>({ variant: "primary", label: t('pages.translate.startTranslation') });

    const configInitRef = useRef(false);

    const { folders, exploreFolder } = useFolders();
    const { data: exploreEntries } = exploreFolder(currentPath);
    const { searchMedia, getEpisode } = useTMDB();
    const { presets } = usePresets();
    const { languages } = useLanguages();
    const { config } = useConfig();
    const { translate } = useTranslate();
    const { currentEvent } = useGlobalSSE();
    const { favoriteModels, filteredModels, modelsQuery } = useOpenRouter();

    const modelOptions = favoriteModels.length > 0 ? favoriteModels : filteredModels;

    // Initialize defaults from config (only once)
    useEffect(() => {
        if (config && !configInitRef.current) {
            configInitRef.current = true;
            if (config.default_model) setSelectedModel(config.default_model);
            if (config.default_preset) setSelectedPreset(config.default_preset);
            if (config.default_language) setSelectedLanguage(config.default_language);
            setRemoveSDH(config.remove_sdh_default ?? false);
        }
    }, [config]);

    const handleSearch = useCallback((query: string) => {
        searchMedia.mutate({ query });
    }, [searchMedia.mutate]);

    useEffect(() => {
        if (!selectedFile) return;

        const parsed = parseMediaFilename(selectedFile);

        setSearchQuery(parsed.title);
        setSeason(parsed.season || "");
        setEpisode(parsed.episode || "");
        setSelectedMedia(null);
        setEpisodeData(null);
        setTranslateButtonState({ variant: "primary", label: t('pages.translate.startTranslation') });

        if (!parsed.title) return;

        let cancelled = false;
        searchMedia.mutateAsync({ query: parsed.title })
            .then((data) => {
                if (cancelled) return;
                if (data.results && data.results.length > 0) {
                    const firstMatch = data.results[0];
                    setSelectedMedia(firstMatch);
                    setSearchQuery(firstMatch.name || firstMatch.title || "");
                    toast.success(t('pages.translate.mediaLinked', { title: firstMatch.name || firstMatch.title }));
                }
            })
            .catch(() => {});

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile]);

    useEffect(() => {
        const isTV = selectedMedia?.media_type === 'tv' || !!selectedMedia?.name;
        if (!selectedMedia || !isTV || !season || !episode) return;

        let cancelled = false;
        getEpisode.mutateAsync({
            showId: selectedMedia.id,
            season: Number(season),
            episode: Number(episode)
        })
        .then((data) => { if (!cancelled) setEpisodeData(data); })
        .catch(() => {});

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMedia, season, episode]);

    useEffect(() => {
        if (translate.isSuccess && translate.data) {
            setActiveJobId(translate.data.job_id);
            setActiveOutputPath(translate.data.output_path);
            setIsJobRunning(true);
            setTranslateButtonState({ variant: "primary", label: t('pages.translate.translatingProgress', { percent: 0 }) });
            setJobDialogOpen(true);
            toast.success(t('pages.translate.translationStarted'));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translate.isSuccess]);

    useEffect(() => {
        if (!currentEvent || currentEvent.module !== 'translate') return;
        if (currentEvent.data?.job_id && currentEvent.data.job_id !== activeJobId) return;

        if (currentEvent.type === 'progress' && currentEvent.data?.percent !== undefined) {
            setTranslateButtonState({ variant: "primary", label: t('pages.translate.translatingProgress', { percent: currentEvent.data.percent }) });
        } else if (currentEvent.type === 'success') {
            setIsJobRunning(false);
            setTranslateButtonState({ variant: "success", label: t('pages.translate.translationCompleted') });
            setTimeout(() => {
                setTranslateButtonState({ variant: "primary", label: t('pages.translate.startTranslation') });
                setActiveJobId(null);
            }, 3000);
        } else if (currentEvent.type === 'error') {
            setIsJobRunning(false);
            setTranslateButtonState({ variant: "error", label: t('pages.translate.translationError') });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentEvent]);

    useEffect(() => {
        if (translate.isError) {
            setTranslateButtonState({ variant: "error", label: t('pages.translate.translationError') });
            toast.error(t('pages.translate.translationError'));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translate.isError]);

    const handleSelectMedia = (media: TMDBResult) => {
        setSelectedMedia(media);
        setSearchQuery(media.name || media.title || "");
    };

    const handleTranslate = () => {
        if (!selectedFile || !selectedModel || !selectedPreset || !selectedLanguage) return;
        translate.mutate({
            filePath: selectedFile,
            targetLang: selectedLanguage,
            preset: selectedPreset,
            model: selectedModel,
            removeSDH,
            context,
        });
    };

    const selectedModelName = modelOptions.find(m => m.id === selectedModel)?.name || selectedModel;
    const selectedPresetLabel = presets.find(p => p.alias === selectedPreset)?.alias || selectedPreset;
    const selectedLanguageName = languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage;

    const canTranslate = !!selectedFile && !!selectedModel && !!selectedPreset && !!selectedLanguage && !translate.isPending && !isJobRunning;

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
                    <Typography variant="muted">{t('pages.translate.selectSubtitle')}</Typography>
                </div>
            );
        }

        return (
            <Card variant="secondary" className={styles.fullHeightCard}>
                <Card.Header>
                    <Typography variant="h3" as="p">{t('pages.translate.metadataEditor')}</Typography>
                </Card.Header>
                <Card.Description>
                    <Typography variant="muted">
                        {t('pages.translate.metadataEditorDescription')}
                    </Typography>
                </Card.Description>

                <Card.Content className={styles.scrollableContent}>
                    <div className={clsx(styles.searchContainer, selectedMedia?.media_type === 'tv' && styles.searchContainerTV)}>
                        <AsyncSearch<TMDBResult>
                            label={t('pages.translate.searchTMDB')}
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
                                            {item.media_type === 'tv' ? t('pages.translate.series') : t('pages.translate.movie')} • {(item.first_air_date || item.release_date)?.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                            )}
                        />

                        {selectedMedia?.media_type === 'tv' && (
                            <div className={styles.shortInputsRow}>
                                <Input label={t('pages.translate.season')} value={season} onChange={(e) => setSeason(e.target.value)} type="number" fullWidth />
                                <Input label={t('pages.translate.episode')} value={episode} onChange={(e) => setEpisode(e.target.value)} type="number" fullWidth />
                            </div>
                        )}
                    </div>
                    <div className={styles.editorContainer}>
                        <div className={styles.mediaCard}>
                            <div className={styles.mediaBackdrop} style={{ backgroundImage: `url(${selectedMedia?.backdrop_path ? `${TMDB_IMAGE_BASE_URL}w500${selectedMedia.backdrop_path}` : ''})` }}></div>
                            <div className={styles.visuals}>
                                {selectedMedia?.poster_path ? (
                                    <img src={`${TMDB_IMAGE_BASE_URL}w500${selectedMedia.poster_path}`} className={styles.posterImage} alt={t('pages.translate.posterAlt')} />
                                ) : (
                                    <ImagePlaceholder aspectRatio="poster" className={styles.posterImage} />
                                )}
                            </div>
                            <div className={styles.mediaInfo}>
                                <Typography variant="h2" as="h1" className={styles.mediaTitle}>
                                    {selectedMedia?.name || selectedMedia?.title || t('pages.translate.unknownTitle')}
                                </Typography>
                                <Typography variant="muted" className={styles.mediaMeta}>
                                    {selectedMedia?.media_type === 'tv' ? t('pages.translate.series') : t('pages.translate.movie')} • {(selectedMedia?.first_air_date || selectedMedia?.release_date)?.split('-')[0]}
                                </Typography>
                                <Typography variant="body" className={styles.mediaOverview}>
                                    {selectedMedia?.overview || t('pages.translate.noOverview')}
                                </Typography>
                            </div>
                        </div>

                        {(selectedMedia?.media_type === 'tv') && (
                            <div className={styles.mediaCard}>
                                <div className={styles.visuals}>
                                    {episodeData?.still_path ? (
                                        <img src={`${TMDB_IMAGE_BASE_URL}w300${episodeData.still_path}`} className={styles.stillImage} alt={t('pages.translate.stillAlt')} />
                                    ) : (
                                        <ImagePlaceholder aspectRatio="still" className={styles.stillImage} />
                                    )}
                                </div>
                                <div className={styles.mediaInfo}>
                                    <Typography variant="h3" as="h2" className={styles.mediaTitle}>
                                        {episodeData ? `S${String(episodeData.season_number).padStart(2, '0')}E${String(episodeData.episode_number).padStart(2, '0')} - ${episodeData.name}` : t('pages.translate.selectSeasonEpisode')}
                                    </Typography>
                                    <Typography variant="muted" className={styles.mediaMeta}>
                                        {episodeData ? `${t('pages.translate.series')} • ${episodeData.air_date?.split('-')[0]}` : t('pages.translate.noEpisodeInfo')}
                                    </Typography>
                                    <Typography variant="body" className={styles.mediaOverview}>
                                        {episodeData?.overview || t('pages.translate.noEpisodeOverview')}
                                    </Typography>
                                </div>
                            </div>
                        )}

                        <div className={styles.metadataEditor}>
                            <div className={styles.customMetadataSection}>
                                <div>
                                    <Typography variant="h3" as="p">{t('pages.translate.customMetadata')}</Typography>
                                    <Typography variant="muted" className={styles.customMetadataDescription}>
                                        {t('pages.translate.customMetadataDescription')}
                                    </Typography>
                                </div>
                                <Textarea
                                    placeholder={t('pages.translate.customMetadataPlaceholder')}
                                    fullWidth
                                    rows={4}
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                />
                            </div>
                            <div className={styles.modelAndOptionsSection}>
                                <div>
                                    <Typography variant="h3" as="p">{t('pages.translate.translationOptions')}</Typography>
                                    <Typography variant="muted" className={styles.customMetadataDescription}>
                                        {t('pages.translate.translationOptionsDescription')}
                                    </Typography>
                                </div>
                                <Select
                                    label={t('pages.translate.modelLabel')}
                                    placeholder={modelsQuery.isLoading ? t('common.loading') : t('pages.translate.selectModel')}
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    options={modelOptions.map(m => ({ value: m.id, label: m.name }))}
                                    disabled={modelsQuery.isLoading}
                                    fullWidth
                                />
                                <Select
                                    label={t('pages.translate.presetLabel')}
                                    placeholder={t('pages.translate.selectPreset')}
                                    value={selectedPreset}
                                    onChange={(e) => setSelectedPreset(e.target.value)}
                                    options={presets.map(p => ({ value: p.alias, label: p.name }))}
                                    fullWidth
                                />
                                <Select
                                    label={t('pages.translate.targetLanguage')}
                                    placeholder={t('common.selectLanguage')}
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    options={languages.map(l => ({ value: l.code, label: l.name }))}
                                    fullWidth
                                />
                                <Checkbox
                                    label={t('pages.translate.removeSDH')}
                                    helperText={t('pages.translate.removeSDHHelp')}
                                    checked={removeSDH}
                                    onChange={(e) => setRemoveSDH(e.target.checked)}
                                />
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
                        <Typography variant="span" color="primary">{t('pages.translate.file')}</Typography> {selectedFile}
                    </Typography>
                    <div className={styles.selectedTranslateInfo}>
                        {selectedModel && (
                            <>
                                <Badge variant="success" className={styles.truncateLabel}>{selectedModelName}</Badge>
                            </>
                        )}
                        {selectedPreset && (
                            <>
                                <Badge variant="secondary">{selectedPresetLabel}</Badge>
                            </>
                        )}
                        {selectedLanguage && (
                            <>
                                <Badge variant="primary">{selectedLanguageName}</Badge>
                            </>
                        )}
                        {removeSDH && (
                            <Badge variant="error">{t('pages.translate.removeSDH')}</Badge>
                        )}
                    </div>
                </div>
            )}
            <Button
                onClick={handleTranslate}
                disabled={!canTranslate}
                loading={translate.isPending}
                variant={translateButtonState.variant}
            >
                {translate.isPending ? t('pages.translate.translating') : translateButtonState.label}
            </Button>
        </div>
    );

    return (
        <>
        <SplitPageLayout
            titleKey="pages.translate.title"
            leftContent={renderLeft()}
            rightContent={renderRight()}
            footerContent={renderFooter()}
        />
        <TranslationJobDialog
            isOpen={jobDialogOpen}
            onClose={() => setJobDialogOpen(false)}
            jobId={activeJobId}
            outputPath={activeOutputPath}
        />
        </>
    );
}