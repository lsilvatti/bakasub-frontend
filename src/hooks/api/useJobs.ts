import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services';
import type { TranslationJob } from '@/types';

interface JobsParams {
  page?: number;
  limit?: number;
}

interface JobsResponse {
  jobs: TranslationJob[];
  total: number;
  page: number;
  limit: number;
}

export function useJobs(params: JobsParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async (): Promise<JobsResponse> => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      return apiClient.get<JobsResponse>(`/jobs?${searchParams.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });
}
