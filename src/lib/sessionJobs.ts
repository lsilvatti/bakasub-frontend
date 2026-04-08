const STORAGE_KEY = 'bakasub_session_jobs';

export interface SessionJob {
  id: string;
  filePath: string;
  outputPath?: string;
  targetLang: string;
  model: string;
  addedAt: number;
}

function read(): SessionJob[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(jobs: SessionJob[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event('sessionjobs'));
}

export function addSessionJob(job: SessionJob) {
  const jobs = read();
  if (jobs.some(j => j.id === job.id)) return;
  jobs.unshift(job);
  write(jobs);
}

export function getSessionJobs(): SessionJob[] {
  return read();
}

export function removeSessionJobs(ids: string[]) {
  const set = new Set(ids);
  write(read().filter(j => !set.has(j.id)));
}
