import axios from 'axios';
import { BaseAPI } from './api';

export function createOpenRouterClient(apiKey: string) {
  const instance = axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://bakasub.com',
      'X-Title': 'Bakasub',
    },
  });
  return BaseAPI(instance);
}

// Backward-compat singleton (no key) — kept for non-auth endpoints.
export const openRouterClient = createOpenRouterClient('');