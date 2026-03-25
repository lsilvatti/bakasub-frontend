import { useQuery } from '@tanstack/react-query';
import { tmdbClient } from '@/services';
import { type TMDBResult, type TMDBEpisode } from '@/types';
import { useTranslation } from 'react-i18next';

export function useTMDB() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US';

  const searchMedia = (query: string, enabled: boolean = false) => {
    return useQuery({
      queryKey: ['tmdb-search', query, lang],
      queryFn: async () => {
        const res = await tmdbClient.get<{ results: TMDBResult[] }>(
          `/search/multi?query=${encodeURIComponent(query)}&language=${lang}`
        );

        const media = res.results?.filter(r => r.media_type === 'movie' || r.media_type === 'tv') || [];

        if (media.length === 0) {
          throw new Error('Nenhuma mídia encontrada com esse título.');
        }

        return media;
      },
      enabled: enabled && !!query && !!import.meta.env.VITE_TMDB_ACCESS_TOKEN,
      staleTime: 1000 * 60 * 60 * 24, // 24h de cache
      retry: 1,
    });
  };

  const getEpisode = (seriesId: number | null, season: string, episode: string, enabled: boolean = false) => {
    return useQuery({
      queryKey: ['tmdb-episode', seriesId, season, episode, lang],
      queryFn: async () => {
        if (!seriesId) throw new Error('ID da série é obrigatório para buscar o episódio.');

        const epRes = await tmdbClient.get<TMDBEpisode>(
          `/tv/${seriesId}/season/${season}/episode/${episode}?language=${lang}`
        );

        return {
          title: epRes.name,
          overview: epRes.overview,
          poster: epRes.still_path ? `https://image.tmdb.org/t/p/w500${epRes.still_path}` : null,
        };
      },
      enabled: enabled && !!seriesId && !!season && !!episode,
      staleTime: 1000 * 60 * 60 * 24,
      retry: 1,
    });
  };

  return { searchMedia, getEpisode };
}