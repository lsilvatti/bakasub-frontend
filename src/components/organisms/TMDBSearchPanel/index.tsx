import { useCallback } from 'react';
import { Checkbox, Input } from '@/components/atoms';
import { AsyncSearch, MediaCard } from '@/components/molecules';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from './TMDBSearchPanel.module.css';
import type { TMDBResult, TMDBEpisode } from '@/types';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export interface TMDBSearchPanelProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: (query: string) => void;
    isSearching: boolean;
    searchResults: TMDBResult[];
    selectedMedia: TMDBResult | null;
    onSelectMedia: (media: TMDBResult) => void;
    season: string;
    onSeasonChange: (value: string) => void;
    episode: string;
    onEpisodeChange: (value: string) => void;
    episodeData: TMDBEpisode | null;
}

export function TMDBSearchPanel({
    enabled,
    onToggle,
    searchQuery,
    onSearchQueryChange,
    onSearch,
    isSearching,
    searchResults,
    selectedMedia,
    onSelectMedia,
    season,
    onSeasonChange,
    episode,
    onEpisodeChange,
    episodeData,
}: TMDBSearchPanelProps) {
    const { t } = useTranslation();

    const isTV = selectedMedia?.media_type === 'tv';
    const mediaTitle = selectedMedia?.name || selectedMedia?.title || t('pages.translate.unknownTitle');
    const mediaType = isTV ? t('pages.translate.series') : t('pages.translate.movie');
    const mediaYear = (selectedMedia?.first_air_date || selectedMedia?.release_date)?.split('-')[0];

    const renderSearchResult = useCallback((item: TMDBResult) => (
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
    ), [t]);

    return (
        <>
            <div className={styles.tmdbToggle}>
                <Checkbox
                    label={t('pages.translate.useTmdbMetadata')}
                    helperText={t('pages.translate.useTmdbMetadataHelp')}
                    checked={enabled}
                    onChange={(e) => onToggle(e.target.checked)}
                />
            </div>

            {enabled && (
                <>
                    <div className={clsx(styles.searchContainer, isTV && styles.searchContainerTV)}>
                        <AsyncSearch<TMDBResult>
                            label={t('pages.translate.searchTMDB')}
                            value={searchQuery}
                            onChange={onSearchQueryChange}
                            onSearch={onSearch}
                            isLoading={isSearching}
                            results={searchResults}
                            onSelect={onSelectMedia}
                            keyExtractor={(item) => item.id}
                            fullWidth
                            renderResult={renderSearchResult}
                        />

                        {isTV && (
                            <div className={styles.shortInputsRow}>
                                <Input label={t('pages.translate.season')} value={season} onChange={(e) => onSeasonChange(e.target.value)} type="number" fullWidth />
                                <Input label={t('pages.translate.episode')} value={episode} onChange={(e) => onEpisodeChange(e.target.value)} type="number" fullWidth />
                            </div>
                        )}
                    </div>

                    <div className={styles.mediaCards}>
                        <MediaCard
                            variant="poster"
                            title={mediaTitle}
                            meta={`${mediaType} • ${mediaYear || ''}`}
                            overview={selectedMedia?.overview || t('pages.translate.noOverview')}
                            posterPath={selectedMedia?.poster_path}
                            backdropPath={selectedMedia?.backdrop_path}
                            posterAlt={t('pages.translate.posterAlt')}
                        />

                        {isTV && (
                            <MediaCard
                                variant="still"
                                title={episodeData
                                    ? `S${String(episodeData.season_number).padStart(2, '0')}E${String(episodeData.episode_number).padStart(2, '0')} - ${episodeData.name}`
                                    : t('pages.translate.selectSeasonEpisode')
                                }
                                meta={episodeData
                                    ? `${t('pages.translate.series')} • ${episodeData.air_date?.split('-')[0]}`
                                    : t('pages.translate.noEpisodeInfo')
                                }
                                overview={episodeData?.overview || t('pages.translate.noEpisodeOverview')}
                                stillPath={episodeData?.still_path}
                                stillAlt={t('pages.translate.stillAlt')}
                            />
                        )}
                    </div>
                </>
            )}
        </>
    );
}
