import { useMutation } from '@tanstack/react-query';
import { tmdbClient } from '@/services';
import { type TMDBResult, type TMDBEpisode } from '@/types';
import { useTranslation } from 'react-i18next';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function useTMDB() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US';
  const isEnglish = lang === 'en-US';

  const searchMedia = useMutation({
    mutationFn: async ({ query }: { query: string }) => {
      if (!query || !import.meta.env.VITE_TMDB_ACCESS_TOKEN) {
          throw new Error('Query ou Token do TMDB faltando.');
      }

      const encodedQuery = encodeURIComponent(query);
      const [res, enRes] = await Promise.all([
        tmdbClient.get<{ results: TMDBResult[] }>(`/search/multi?query=${encodedQuery}&language=${lang}`),
        isEnglish ? null : tmdbClient.get<{ results: TMDBResult[] }>(`/search/multi?query=${encodedQuery}&language=en-US`),
      ]);

      const media = res.results?.filter(r => r.media_type === 'movie' || r.media_type === 'tv') || [];

      if (media.length === 0) {
        throw new Error('Nenhuma mídia encontrada com esse título.');
      }

      const enMap = new Map(
        (enRes?.results ?? []).map(r => [r.id, r])
      );

      const processedMedia = media.map(r => {
        const en = enMap.get(r.id);
        return {
          ...r,
          posterImageUrl: r.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${r.poster_path}` : null,
          backdropImageUrl: r.backdrop_path ? `${TMDB_IMAGE_BASE_URL}w780${r.backdrop_path}` : null,
          enTitle: en?.title ?? r.title,
          enName: en?.name ?? r.name,
          enOverview: en?.overview ?? r.overview,
        };
      });

      return { results: processedMedia };
    },
  });

  const getEpisode = useMutation({
    mutationFn: async ({ showId, season, episode }: { showId: number; season: number; episode: number }) => {
      if (!showId) throw new Error('ID da série é obrigatório para buscar o episódio.');

      const path = `/tv/${showId}/season/${season}/episode/${episode}`;
      const [epRes, enEpRes] = await Promise.all([
        tmdbClient.get<TMDBEpisode>(`${path}?language=${lang}`),
        isEnglish ? null : tmdbClient.get<TMDBEpisode>(`${path}?language=en-US`),
      ]);

      return {
        ...epRes,
        title: epRes.name,
        overview: epRes.overview,
        poster: epRes.still_path ? `${TMDB_IMAGE_BASE_URL}w500${epRes.still_path}` : null,
        enName: enEpRes?.name ?? epRes.name,
        enOverview: enEpRes?.overview ?? epRes.overview,
      };
    },
  });

  return { searchMedia, getEpisode };
}