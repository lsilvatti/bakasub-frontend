interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_TMDB_ACCESS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}