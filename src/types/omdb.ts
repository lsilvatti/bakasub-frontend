export interface OMDBResponse {
  Response: "True" | "False";
  Error?: string;
}

export interface OMDBMedia extends OMDBResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Poster: string;
  Metascore: string;
  imdbRating: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  totalSeasons?: string;
}

export interface OMDBEpisode extends OMDBMedia {
  Season: string;
  Episode: string;
  seriesID: string;
}

export interface OMDBSearchParams {
  title: string;
  year?: string;
  type?: 'movie' | 'series' | 'episode';
  season?: string;
  episode?: string;
}