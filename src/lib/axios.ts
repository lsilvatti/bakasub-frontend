import axios from 'axios';
import { getApiBaseUrl } from '@/lib/runtimeConfig';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});