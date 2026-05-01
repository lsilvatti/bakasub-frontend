import type { RequiredApiKey } from '@/hooks/useApiKeyRequirements';
import type { VideoFeature } from '@/hooks/useVideoToolRequirements';

export interface AppRoute {
  path: string;
  title: string;
  element: React.ReactNode;
  showInSidebar: boolean;
  icon?: React.ElementType;
  requiredApiKeys?: RequiredApiKey[];
  videoFeature?: VideoFeature;
}

export interface NavSeparator {
  type: 'separator';
}

export type RouteEntry = AppRoute | NavSeparator;

export function isSeparator(entry: RouteEntry): entry is NavSeparator {
  return 'type' in entry && entry.type === 'separator';
}
