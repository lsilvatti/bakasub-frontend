import { useState, useEffect, useCallback, useRef } from "react";
import { Select, Typography, Card } from "@/components/atoms";
import { FileBrowser, TranslationJobDialog, TMDBSearchPanel, PreflightDialog } from "@/components/organisms";
import { TranslationOptions, TranslateFooter } from "@/components/molecules";
import { SplitPageLayout } from "@/components/templates/SplitPageLayout";
import { useFolders, useTMDB, useToast, usePresets, useLanguages, useTranslate, useConfig, useOpenRouter, useGlobalSSE } from "@/hooks";
import styles from "./Translate.module.css";
import { useTranslation } from "react-i18next";
import type { TMDBResult } from "@/types";

import { parseMediaFilename } from "@/lib/mediaParser";
import { addSessionJob } from "@/lib/sessionJobs";

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
    const [useTmdbMetadata, setUseTmdbMetadata] = useState<boolean>(true);
    const [context, setContext] = useState<string>("");

    const [jobDialogOpen, setJobDialogOpen] = useState(false);
    const [preflightDialogOpen, setPreflightDialogOpen] = useState(false);
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
    const { translate, preflight } = useTranslate();
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
            setUseTmdbMetadata(config.tmdb_metadata_enabled ?? true);
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
        setContext("");
        setTranslateButtonState({ variant: "primary", label: t('pages.translate.startTranslation') });

        if (!parsed.title || !useTmdbMetadata) return;

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
        if (!selectedMedia) return;
        const isTV = selectedMedia.media_type === 'tv' || !!selectedMedia.name;
        if (isTV) return;
        const parts: string[] = [];
        parts.push(`Title: ${selectedMedia.title || selectedMedia.name}`);
        const year = (selectedMedia.release_date || '').split('-')[0];
        if (year) parts.push(`Year: ${year}`);
        if (selectedMedia.overview) parts.push(`Overview: ${selectedMedia.overview}`);
        setContext(parts.join('\n'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMedia]);

    useEffect(() => {
        if (!episodeData || !selectedMedia) return;
        const parts: string[] = [];
        parts.push(`Series: ${selectedMedia.name || selectedMedia.title}`);
        if (selectedMedia.overview) parts.push(`Series Overview: ${selectedMedia.overview}`);
        const epCode = `S${String(episodeData.season_number).padStart(2, '0')}E${String(episodeData.episode_number).padStart(2, '0')}`;
        parts.push(`Episode: ${epCode} - ${episodeData.name}`);
        if (episodeData.overview) parts.push(`Episode Overview: ${episodeData.overview}`);
        setContext(parts.join('\n'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episodeData]);

    useEffect(() => {
        if (translate.isSuccess && translate.data) {
            setActiveJobId(translate.data.job_id);
            setActiveOutputPath(translate.data.output_path);
            setIsJobRunning(true);
            setTranslateButtonState({ variant: "primary", label: t('pages.translate.translatingProgress', { percent: 0 }) });
            setJobDialogOpen(true);
            addSessionJob({
                id: translate.data.job_id,
                filePath: selectedFile!,
                outputPath: translate.data.output_path,
                targetLang: selectedLanguage,
                model: selectedModel,
                addedAt: Date.now(),
            });
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
            setTimeout(() => {
                setTranslateButtonState({ variant: "primary", label: t('pages.translate.startTranslation') });
            }, 3000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentEvent]);

    useEffect(() => {
        if (translate.isError) {
            setTranslateButtonState({ variant: "error", label: t('pages.translate.translationError') });
            toast.error(t('pages.translate.translationError'));
            setTimeout(() => {
                setTranslateButtonState({ variant: "primary", label: t('pages.translate.startTranslation') });
            }, 3000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translate.isError]);

    const handleSelectMedia = (media: TMDBResult) => {
        setSelectedMedia(media);
        setSearchQuery(media.name || media.title || "");
    };

    const handleToggleTmdbMetadata = (enabled: boolean) => {
        setUseTmdbMetadata(enabled);
        if (!enabled) {
            setSelectedMedia(null);
            setEpisodeData(null);
            setSearchQuery("");
            setSeason("");
            setEpisode("");
            setContext("");
        }
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

    const handlePreflight = () => {
        if (!selectedFile || !selectedModel || !selectedPreset || !selectedLanguage) return;
        setPreflightDialogOpen(true);
        preflight.mutate({
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
                    <TMDBSearchPanel
                        enabled={useTmdbMetadata}
                        onToggle={handleToggleTmdbMetadata}
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                        onSearch={handleSearch}
                        isSearching={searchMedia.isPending}
                        searchResults={searchMedia.data?.results || []}
                        selectedMedia={selectedMedia}
                        onSelectMedia={handleSelectMedia}
                        season={season}
                        onSeasonChange={setSeason}
                        episode={episode}
                        onEpisodeChange={setEpisode}
                        episodeData={episodeData}
                    />

                    <TranslationOptions
                        context={context}
                        onContextChange={setContext}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        modelOptions={modelOptions.map(m => ({ value: m.id, label: m.name }))}
                        modelsLoading={modelsQuery.isLoading}
                        selectedPreset={selectedPreset}
                        onPresetChange={setSelectedPreset}
                        presetOptions={presets.map(p => ({ value: p.alias, label: p.name }))}
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={setSelectedLanguage}
                        languageOptions={languages.map(l => ({ value: l.code, label: l.name }))}
                        removeSDH={removeSDH}
                        onRemoveSDHChange={setRemoveSDH}
                    />
                </Card.Content>
            </Card>
        );
    };

    const renderFooter = () => (
        <TranslateFooter
            selectedFile={selectedFile}
            selectedModelName={selectedModel ? selectedModelName : ''}
            selectedPresetLabel={selectedPreset ? selectedPresetLabel : ''}
            selectedLanguageName={selectedLanguage ? selectedLanguageName : ''}
            removeSDH={removeSDH}
            canTranslate={canTranslate}
            isPending={translate.isPending}
            buttonVariant={translateButtonState.variant}
            buttonLabel={translateButtonState.label}
            onTranslate={handleTranslate}
            onPreflight={handlePreflight}
            isPreflightLoading={preflight.isPending}
        />
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
        <PreflightDialog
            isOpen={preflightDialogOpen}
            onClose={() => setPreflightDialogOpen(false)}
            data={preflight.data ?? null}
            isLoading={preflight.isPending}
            isError={preflight.isError}
            context={context}
            modelName={selectedModelName}
            onTranslate={handleTranslate}
        />
        </>
    );
}