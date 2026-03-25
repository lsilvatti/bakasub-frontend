import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { type GetLogsParams, type LogsResponse } from '@/types';



export function useLogs(params: GetLogsParams) {
  const getLogs = useQuery<LogsResponse>({
    queryKey: ['logs', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value));
      });
      return apiClient.get<LogsResponse>(`/logs?${searchParams.toString()}`);
    },
    placeholderData: (previousData) => previousData, 
  });

  return {
    data: getLogs.data,
    isLoading: getLogs.isLoading,
  };
}