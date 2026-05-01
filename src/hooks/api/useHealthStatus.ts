import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { type HealthStatus } from '@/types';

export function useHealthStatus() {
  const healthQuery = useQuery<HealthStatus>({
    queryKey: ['health-status'],
    queryFn: () => apiClient.get('/health'),
    staleTime: 30_000,
  });

  return {
    healthStatus: healthQuery.data,
    isLoading: healthQuery.isLoading,
    isError: healthQuery.isError,
    error: healthQuery.error,
  };
}