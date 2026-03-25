export interface Folder {
  id: number;
  alias: string;
  path: string;
}

export interface UserConfig {
  default_model: string;
  default_preset: string;
  remove_sdh_default: boolean;
  video_timeout_minutes: number;
  log_retention_days: number;
}

export interface TranslationPreset {
  id: number;
  alias: string;
  name: string;
  system_prompt: string;
  batch_size: number;
  temperature: number;
}

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface SubtitleTrack {
  id: number;
  language: string;
  name: string;
  codec: string;
  isDefault: boolean;
  isForced: boolean;
}

export interface SystemLog {
  id: number;
  level: string;
  module: string;
  message: string;
  details: string;
  created_at: string;
}

export interface SSEEvent {
  type: 'info' | 'progress' | 'success' | 'error';
  module: 'video' | 'translate' | 'folder' | 'system';
  message: string;
  data?: any;
}

export interface GetLogsParams {
  limit?: number;
  page?: number;
  level?: string;
  module?: string;
}

export interface LogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  limit: number;
}

export interface TranslatePayload {
  filePath: string;
  targetLang: string;
  preset: string;
  model: string;
  removeSDH: boolean;
  context?: string;
}
