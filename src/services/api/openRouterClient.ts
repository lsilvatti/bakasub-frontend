import axios from 'axios';
import { BaseAPI } from './api';

const openRouterAxios = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://bakasub.com', 
    'X-Title': 'Bakasub',
  }
});

export const openRouterClient = BaseAPI(openRouterAxios);