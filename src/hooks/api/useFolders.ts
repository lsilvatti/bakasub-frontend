import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { type Folder } from '@/types';

export function useFolders() {
  const queryClient = useQueryClient();

  const getFolders = useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: () => apiClient.get('/folders'),
  });

  const addFolder = useMutation({
    mutationFn: (data: { alias: string; path: string }) => apiClient.post('/folders', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });

  const removeFolder = useMutation({
    mutationFn: (id: number) => apiClient.delete('/folders', { data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });

  const scanVideos = (path: string | null) => useQuery<string[]>({
    queryKey: ['scanned-videos', path],
    queryFn: () => apiClient.get(`/folders/scan/videos?path=${encodeURIComponent(path!)}`),
    enabled: !!path,
  });

  const scanSubtitles = (path: string | null) => useQuery<string[]>({
    queryKey: ['scanned-subtitles', path],
    queryFn: () => apiClient.get(`/folders/scan/subtitles?path=${encodeURIComponent(path!)}`),
    enabled: !!path,
  });

  return {
    folders: getFolders.data || [],
    isLoadingFolders: getFolders.isLoading,
    addFolder,
    removeFolder,
    scanVideos,
    scanSubtitles,
  };
}