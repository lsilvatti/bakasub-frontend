import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { type Language } from '@/types';

export function useLanguages() {
  const queryClient = useQueryClient();

  const getLanguages = useQuery<{ languages: Language[] }>({
    queryKey: ['languages'],
    queryFn: () => apiClient.get('/languages'),
  });

  const addLanguage = useMutation({
    mutationFn: (data: Omit<Language, 'id'>) => apiClient.post('/languages', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['languages'] }),
  });

  const updateLanguage = useMutation({
    mutationFn: (data: Language) => apiClient.put('/languages', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['languages'] }),
  });

  const deleteLanguage = useMutation({
    mutationFn: (code: string) => apiClient.delete('/languages', { code: code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['languages'] }),
  });

  return {
    languages: getLanguages.data?.languages || [],
    isLoading: getLanguages.isLoading,
    addLanguage, updateLanguage, deleteLanguage
  };
}