import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { type UserConfig } from '@/types';

export function useConfig() {
  const queryClient = useQueryClient();

  const getConfig = useQuery<UserConfig>({
    queryKey: ['config'],
    queryFn: () => apiClient.get('/config'),
  });

  const updateConfig = useMutation({
    mutationFn: (data: UserConfig) => apiClient.put('/config', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config'] }),
  });

  return {
    config: getConfig.data,
    isLoading: getConfig.isLoading,
    updateConfig,
  };
}