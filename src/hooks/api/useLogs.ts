import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { type SystemLog } from '@/types/api';

interface GetLogsParams {
  limit?: number;
  page?: number;
  level?: string;
  module?: string;
}

interface LogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  limit: number;
}

export function useLogs(params: GetLogsParams) {
  const getLogs = useQuery<LogsResponse>({
    queryKey: ['logs', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
      return apiClient.get(`/logs?${searchParams.toString()}`);
    },
    placeholderData: (previousData) => previousData, 
  });

  return {
    data: getLogs.data,
    isLoading: getLogs.isLoading,
  };
}