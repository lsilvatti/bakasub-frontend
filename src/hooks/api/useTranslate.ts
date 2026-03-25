import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services';

interface TranslatePayload {
  filePath: string;
  targetLang: string;
  preset: string;
  model: string;
  removeSDH: boolean;
  context?: string;
}

export function useTranslate() {
  const translate = useMutation({
    mutationFn: (data: TranslatePayload) => 
      apiClient.post<{ output_path: string }>('/openrouter/translate', data),
  });

  return { translate };
}