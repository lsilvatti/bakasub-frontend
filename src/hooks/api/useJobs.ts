import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services';
import type { TranslationJob } from '@/types';

export function useJobs() {
  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.get<{ jobs: TranslationJob[]; total: number }>('/jobs?limit=50'),
    refetchInterval: 10000,
  });

  return { jobsQuery };
}
