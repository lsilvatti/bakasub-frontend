export interface ParsedMedia {
  title: string;
  season?: string;
  episode?: string;
  year?: string;
}

export function parseMediaFilename(filename: string): ParsedMedia {
  let cleanName = filename.replace(/\.[^/.]+$/, "");

  let title = cleanName;
  let season: string | undefined;
  let episode: string | undefined;
  let year: string | undefined;

  const sePattern = /s(\d{1,2})\s*e(\d{1,2})/i;
  const xPattern = /(?:\s|^|\.)(\d{1,2})x(\d{1,2})(?:\s|$|\.)/i;

  let match = cleanName.match(sePattern);
  if (match) {
    season = parseInt(match[1], 10).toString(); 
    episode = parseInt(match[2], 10).toString();
    title = cleanName.substring(0, match.index);
  } else {
    match = cleanName.match(xPattern);
    if (match) {
      season = parseInt(match[1], 10).toString();
      episode = parseInt(match[2], 10).toString();
      title = cleanName.substring(0, match.index);
    }
  }

  const yearPattern = /[\(\s\.\-](19\d{2}|20\d{2})[\)\s\.\-]/;
  const yearMatch = title.match(yearPattern);
  if (yearMatch) {
    year = yearMatch[1];
    title = title.substring(0, yearMatch.index);
  }

  title = title
    .replace(/[\._]/g, " ") 
    .replace(/\b(720p|1080p|2160p|4k|8k|bluray|web-dl|webrip|x264|x265|hevc)\b/gi, "") 
    .replace(/\[.*?\]|\(.*?\)/g, "") 
    .replace(/\s+/g, " ") 
    .trim();

  return { title, season, episode, year };
}