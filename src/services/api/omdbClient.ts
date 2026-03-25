import axios from 'axios';
import { BaseAPI } from './api';

const omdbAxios = axios.create({
  baseURL: 'https://www.omdbapi.com/',
});

export const omdbClient = BaseAPI(omdbAxios);