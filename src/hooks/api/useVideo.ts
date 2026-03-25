import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { type SubtitleTrack } from '@/types';

export function useVideo() {
  const getTracks = (path: string | null) => useQuery<{ tracks: SubtitleTrack[] }>({
    queryKey: ['tracks', path],
    queryFn: () => apiClient.get(`/video/get-tracks?path=${encodeURIComponent(path!)}`),
    enabled: !!path,
  });

  const extractTrack = useMutation({
    mutationFn: (data: { videoPath: string; subtitleId: number }) => 
      apiClient.post<{ srtPath: string }>('/video/extract-track', data),
  });

  const mergeSubtitle = useMutation({
    mutationFn: (data: { videoPath: string; srtPath: string; langCode: string }) => 
      apiClient.post<{ outVideoPath: string }>('/video/merge-subtitle', data),
  });

  return { getTracks, extractTrack, mergeSubtitle };
}