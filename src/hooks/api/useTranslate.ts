import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services';
import type { TranslatePayload } from '@/types';

export function useTranslate() {
  const translate = useMutation({
    mutationFn: (data: TranslatePayload) => 
      apiClient.post<{ job_id: string; output_path: string }>('/openrouter/translate', data),
  });

  return { translate };
}