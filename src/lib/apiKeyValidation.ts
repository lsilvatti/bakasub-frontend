import type { OpenRouterModelRaw, TMDBResult } from '@/types';
import { createOpenRouterClient } from '@/services/api/openRouterClient';
import { createTmdbClient } from '@/services/api/tmdbClient';

export async function validateOpenRouterApiKey(apiKey: string): Promise<void> {
  const normalizedApiKey = apiKey.trim();

  if (!normalizedApiKey) {
    return;
  }

  await createOpenRouterClient(normalizedApiKey).get<OpenRouterModelRaw[]>('/models');
}

export async function validateTmdbAccessToken(token: string): Promise<void> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return;
  }

  await createTmdbClient(normalizedToken).get<{ results: TMDBResult[] }>('/search/multi', {
    params: {
      query: 'bakasub',
      language: 'en-US',
    },
  });
}