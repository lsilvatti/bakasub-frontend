import { useQuery } from '@tanstack/react-query';
import { openRouterClient } from '@/services';
import LocalStorage from '@/lib/storage';
import { type OpenRouterModelRaw, type OpenRouterModel } from '@/types';
import { useState, useEffect, useCallback } from 'react';

export function useOpenRouter() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  const storage = LocalStorage();

  useEffect(() => {
    const saved = storage.getItem<string[]>('bakasub_or_favorites');
    if (saved) {
      try {
        setFavoriteIds(saved);
      } catch (e) {
        console.error("Erro ao fazer parse dos favoritos", e);
      }
    }
  }, []);

  const toggleFavorite = useCallback((modelId: string) => {
    setFavoriteIds(prev => {
      const isFav = prev.includes(modelId);
      const newFavs = isFav 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId];
      
      storage.setItem('bakasub_or_favorites', newFavs);
      return newFavs;
    });
  }, []);

  const modelsQuery = useQuery({
    queryKey: ['openRouterModels', favoriteIds],
    queryFn: async () => {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        throw new Error('API Key do OpenRouter não encontrada no .env.');
      }

      const res = await openRouterClient.get<{ data: OpenRouterModelRaw[] }>('/models');

      if (!res.data || res.data.length === 0) {
        throw new Error('Nenhum modelo retornado pela API.');
      }

      const processed: OpenRouterModel[] = res.data.map(model => {
        const costPrompt = parseFloat(model.pricing.prompt) * 1000000;
        const costCompletion = parseFloat(model.pricing.completion) * 1000000;

        return {
          id: model.id,
          name: model.name,
          description: model.description,
          context_length: model.context_length,
          pricingPrompt1M: isNaN(costPrompt) ? 0 : costPrompt,
          pricingCompletion1M: isNaN(costCompletion) ? 0 : costCompletion,
          isFavorite: favoriteIds.includes(model.id),
        };
      });

      return processed.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name);
        return a.isFavorite ? -1 : 1;
      });
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const favoriteModels = modelsQuery.data?.filter(m => m.isFavorite) || [];

  return { 
    modelsQuery, 
    favoriteModels, 
    toggleFavorite 
  };
}