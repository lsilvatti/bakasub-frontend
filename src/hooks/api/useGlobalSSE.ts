import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type SSEEvent } from '@/types/api';

export function useGlobalSSE() {
  const queryClient = useQueryClient();
  const [currentEvent, setCurrentEvent] = useState<SSEEvent | null>(null);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
    const eventSource = new EventSource(`${apiBase}/events`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData: SSEEvent = JSON.parse(event.data);
        setCurrentEvent(parsedData);

        if (parsedData.type === 'success') {
          if (parsedData.module === 'folder') {
             queryClient.invalidateQueries({ queryKey: ['scanned-videos'] });
             queryClient.invalidateQueries({ queryKey: ['scanned-subtitles'] });
          }
          setTimeout(() => setCurrentEvent(null), 3000);
        }
      } catch (err) {
        console.error('Falha no parse do SSE', err);
      }
    };

    return () => eventSource.close();
  }, [queryClient]);

  return { currentEvent, clearEvent: () => setCurrentEvent(null) };
}