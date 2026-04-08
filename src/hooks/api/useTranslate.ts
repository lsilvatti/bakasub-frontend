import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services';
import type { TranslatePayload, PreflightPayload, PreflightResult } from '@/types';

export function useTranslate() {
  const translate = useMutation({
    mutationFn: (data: TranslatePayload) => 
      apiClient.post<{ job_id: string; output_path: string }>('/openrouter/translate', data),
  });

  const preflight = useMutation({
    mutationFn: (data: PreflightPayload) =>
      apiClient.post<PreflightResult>('/openrouter/preflight', data),
  });

  return { translate, preflight };
}