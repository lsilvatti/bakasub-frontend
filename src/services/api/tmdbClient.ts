import axios from 'axios';
import { BaseAPI } from './api';

const tmdbAxios = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
    accept: 'application/json'
  }
});

export const tmdbClient = BaseAPI(tmdbAxios);