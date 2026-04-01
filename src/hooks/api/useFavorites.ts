import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services';

export function useFavorites() {
  const queryClient = useQueryClient();

  const getFavorites = useQuery<string[]>({
    queryKey: ['favorites'],
    queryFn: () => apiClient.get('/favorites'),
  });

  const updateFavorites = useMutation({
    mutationFn: (favorites: string[]) =>
      apiClient.put('/favorites', { favorite_models: favorites }),
    onMutate: async (newFavorites) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<string[]>(['favorites']);
      queryClient.setQueryData(['favorites'], newFavorites);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavorite = (modelId: string) => {
    const current = getFavorites.data ?? [];
    const isFav = current.includes(modelId);
    const next = isFav
      ? current.filter((id) => id !== modelId)
      : [...current, modelId];
    updateFavorites.mutate(next);
  };

  return {
    favorites: getFavorites.data ?? [],
    isLoading: getFavorites.isLoading,
    toggleFavorite,
    updateFavorites,
  };
}
