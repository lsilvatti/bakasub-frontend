import { api } from '../../lib/axios';
import { BaseAPI } from './api';

export const apiClient = BaseAPI(api);