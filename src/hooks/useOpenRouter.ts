import { useQuery } from '@tanstack/react-query';
import { openRouterClient } from '@/services';
import { type OpenRouterModelRaw, type BakasubModel } from '@/types';
import { useState, useMemo } from 'react';
import { useFavorites } from '@/hooks/api/useFavorites';

export type SortOption = 'name' | 'price_asc' | 'price_desc' | 'context';

export function useOpenRouter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const { favorites: favoriteIds, toggleFavorite } = useFavorites();

const modelsQuery = useQuery({
    queryKey: ['openRouterModels'],
    queryFn: async () => {
      const data = await openRouterClient.get<OpenRouterModelRaw[]>('/models');
      const rawModels = data ?? [];

      return rawModels.filter((m: any) => {
        const id = m.id.toLowerCase();
        
        if (id.includes('embedding') || id.includes('embed')) return false;
        
        const isImageOrAudio = 
          id.includes('dall-e') || 
          id.includes('midjourney') || 
          id.includes('flux') || 
          id.includes('sdxl') || 
          id.includes('stable-diffusion') ||
          id.includes('tts') || 
          id.includes('whisper');
          
        if (isImageOrAudio) return false;

        const modality = m.architecture?.modality || '';
        if (modality && modality.includes('->image')) return false;

        return true;
      });
    },
    staleTime: 1000 * 60 * 60, 
  });

  const filteredModels = useMemo(() => {
    if (!modelsQuery.data) return [];
    
    let list: BakasubModel[] = modelsQuery.data.map(m => {
      const inputPrice = parseFloat(m.pricing?.prompt || "0") * 1000000;
      const outputPrice = parseFloat(m.pricing?.completion || "0") * 1000000;

      return {
        id: m.id,
        name: m.name,
        description: m.description,
        contextLength: m.context_length,
        maxOutput: m.top_provider?.max_completion_tokens || 0,
        pricingInput1M: isNaN(inputPrice) ? 0 : inputPrice,
        pricingOutput1M: isNaN(outputPrice) ? 0 : outputPrice,
        isModerated: m.top_provider?.is_moderated ?? false,
        isFavorite: favoriteIds.includes(m.id),
      };
    });

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(term) || m.id.toLowerCase().includes(term));
    }

    if (onlyFavorites) {
      list = list.filter(m => m.isFavorite);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.pricingInput1M - b.pricingInput1M;
        case 'price_desc': return b.pricingInput1M - a.pricingInput1M;
        case 'context': return b.contextLength - a.contextLength;
        default: return a.name.localeCompare(b.name);
      }
    });

    if (sortBy === 'name' && !onlyFavorites) {
      list.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }

    return list;
  }, [modelsQuery.data, searchQuery, favoriteIds, sortBy, onlyFavorites]);

  return { 
    modelsQuery, 
    filteredModels, 
    favoriteModels: filteredModels.filter(m => m.isFavorite),
    toggleFavorite,
    filters: { searchQuery, setSearchQuery, sortBy, setSortBy, onlyFavorites, setOnlyFavorites }
  };
}