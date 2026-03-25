export interface TMDBResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  overview: string;
  poster_path: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  season_number: number;
  episode_number: number;
}