import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services';
import type { TranslatePayload } from '@/types';

export function useTranslate() {
  const translate = useMutation({
    mutationFn: (data: TranslatePayload) => 
      apiClient.post<{ output_path: string }>('/openrouter/translate', data),
  });

  return { translate };
}