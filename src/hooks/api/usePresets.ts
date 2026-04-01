import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { type TranslationPreset } from '@/types';

export function usePresets() {
  const queryClient = useQueryClient();

  const getPresets = useQuery<{ presets: TranslationPreset[] }>({
    queryKey: ['presets'],
    queryFn: () => apiClient.get('/presets'),
  });

  const addPreset = useMutation({
    mutationFn: (data: Omit<TranslationPreset, 'id'>) => apiClient.post('/presets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  });

  const updatePreset = useMutation({
    mutationFn: (data: TranslationPreset) => apiClient.put('/presets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  });

  const deletePreset = useMutation({
    mutationFn: (id: number) => apiClient.delete('/presets', { id: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  });

  return {
    presets: getPresets.data?.presets || [],
    isLoading: getPresets.isLoading,
    addPreset, updatePreset, deletePreset
  };
}