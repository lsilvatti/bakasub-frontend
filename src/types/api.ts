export interface Folder {
  id: number;
  alias: string;
  path: string;
}

export interface UserConfig {
  default_model: string;
  default_preset: string;
  default_language: string;
  remove_sdh_default: boolean;
  video_timeout_minutes: number;
  log_retention_days: number;
  openrouter_api_key: string;
  tmdb_access_token: string;
  concurrent_translations: number;
  max_retries: number;
  base_retry_delay: number;
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
  event_type?: string;
  module: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
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

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface BakasubModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  maxOutput: number;
  pricingInput1M: number;
  pricingOutput1M: number;
  isModerated: boolean;
  isFavorite: boolean;
}

export interface TranslationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string;
  target_lang: string;
  preset: string;
  model: string;
  total_lines: number;
  processed_lines: number;
  cached_lines: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}