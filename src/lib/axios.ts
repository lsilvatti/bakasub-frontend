import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data.data,
  (error) => Promise.reject(error.response?.data?.message || error.message)
);