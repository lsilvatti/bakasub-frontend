import { useConfig } from './api/useConfig';

export type RequiredApiKey = 'openrouter' | 'tmdb';

export const REQUIRED_TRANSLATION_API_KEYS: RequiredApiKey[] = ['openrouter', 'tmdb'];

export function useApiKeyRequirements() {
  const { config, isLoading } = useConfig();

  const hasOpenRouterKey = Boolean(config?.openrouter_api_key?.trim());
  const hasTmdbKey = Boolean(config?.tmdb_access_token?.trim());

  const availability = {
    openrouter: hasOpenRouterKey,
    tmdb: hasTmdbKey,
  } satisfies Record<RequiredApiKey, boolean>;

  const getMissingKeys = (requiredApiKeys: RequiredApiKey[] = REQUIRED_TRANSLATION_API_KEYS) => (
    requiredApiKeys.filter((provider) => !availability[provider])
  );

  const missingTranslationKeys = getMissingKeys();

  return {
    isLoading,
    hasOpenRouterKey,
    hasTmdbKey,
    hasRequiredTranslationKeys: missingTranslationKeys.length === 0,
    missingTranslationKeys,
    getMissingKeys,
  };
}