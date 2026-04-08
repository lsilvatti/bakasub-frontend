import axios from 'axios';
import { BaseAPI } from './api';

export function createTmdbClient(token: string) {
  const instance = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  });
  return BaseAPI(instance);
}

// Backward-compat singleton (no token).
export const tmdbClient = createTmdbClient('');