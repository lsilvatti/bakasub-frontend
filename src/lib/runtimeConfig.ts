const FALLBACK_API_BASE_URL = 'http://localhost:8080/api/v1';

type RuntimeConfig = {
  apiUrl?: string;
};

function normalizeApiBaseUrl(value?: string): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return FALLBACK_API_BASE_URL;
  }

  return trimmedValue.replace(/\/+$/, '');
}

function readWindowRuntimeConfig(): RuntimeConfig | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.BAKASUB_RUNTIME_CONFIG;
}

export function getApiBaseUrl(): string {
  const runtimeApiUrl = readWindowRuntimeConfig()?.apiUrl;
  return normalizeApiBaseUrl(runtimeApiUrl || import.meta.env.VITE_API_URL);
}

export function getSSEUrl(): string {
  return `${getApiBaseUrl()}/events`;
}