import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { type GetLogsParams, type LogsResponse } from '@/types';

export function useLogs(params: GetLogsParams) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: async (): Promise<LogsResponse> => {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      return apiClient.get<LogsResponse>(`/logs?${searchParams.toString()}`);
    },
    placeholderData: (previousData) => previousData, 
  });
}