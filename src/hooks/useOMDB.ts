import { useQuery } from '@tanstack/react-query';
import { omdbClient } from '@/services';
import { type OMDBMedia, type OMDBEpisode, type OMDBSearchParams } from '@/types';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;



export function useOMDB() {
  const getMediaInfo = (params: OMDBSearchParams, enabled: boolean = false) => {
    return useQuery<OMDBMedia | OMDBEpisode>({
      queryKey: ['omdb', params],
      queryFn: async () => {
        const searchParams = new URLSearchParams({
          apikey: API_KEY,
          t: params.title,
          plot: 'full'
        });

        if (params.year) searchParams.append('y', params.year);
        if (params.type) searchParams.append('type', params.type);
        if (params.season) searchParams.append('Season', params.season);
        if (params.episode) searchParams.append('Episode', params.episode);

        const response = await omdbClient.get<OMDBMedia | OMDBEpisode>(`?${searchParams.toString()}`);

        if (response.Response === 'False') {
          throw new Error(response.Error || 'Mídia não encontrada no OMDB.');
        }

        return response;
      },
      enabled: enabled && !!params.title && !!API_KEY,
      staleTime: 1000 * 60 * 60 * 24, 
      retry: 1, 
    });
  };

  return { getMediaInfo };
}