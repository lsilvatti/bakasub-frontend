import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Badge, Overlay, ProgressBar } from '@/components/atoms';
import { TranslationJobDialog } from '@/components/organisms/TranslationJobDialog';
import { useGlobalSSE } from '@/hooks';
import { apiClient } from '@/services';
import { getSessionJobs, removeSessionJobs, type SessionJob } from '@/lib/sessionJobs';
import type { TranslationJob } from '@/types';
import clsx from 'clsx';
import styles from './JobsSidePanel.module.css';

// Subscribe to sessionStorage changes via custom event
function subscribeSessionJobs(cb: () => void) {
  window.addEventListener('sessionjobs', cb);
  return () => window.removeEventListener('sessionjobs', cb);
}
function getSessionJobsSnapshot() {
  return JSON.stringify(getSessionJobs());
}

export function JobsSidePanel() {
  const { t } = useTranslation();
  const { currentEvent } = useGlobalSSE();
  const queryClient = useQueryClient();

  // Reactive session job list
  const sessionRaw = useSyncExternalStore(subscribeSessionJobs, getSessionJobsSnapshot);
  const sessionJobs: SessionJob[] = JSON.parse(sessionRaw);
  const sessionIds = sessionJobs.map(j => j.id);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Track SSE progress locally for active jobs
  const [liveProgress, setLiveProgress] = useState<Record<string, number>>({});

  // Fetch backend status only for session job IDs
  const jobsQuery = useQuery({
    queryKey: ['session-jobs', sessionIds],
    queryFn: async () => {
      if (sessionIds.length === 0) return [];
      const { jobs } = await apiClient.get<{ jobs: TranslationJob[] }>('/jobs?limit=50');
      return (jobs ?? []).filter(j => sessionIds.includes(j.id));
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.some(j => j.status === 'pending' || j.status === 'processing');
      return hasActive ? 5000 : false;
    },
    enabled: sessionIds.length > 0,
  });

  const backendJobs = jobsQuery.data ?? [];

  // Merge session order with backend data, fallback to session-only stub
  const jobs: (TranslationJob & { outputPath?: string })[] = sessionJobs.map(sj => {
    const backend = backendJobs.find(bj => bj.id === sj.id);
    if (backend) return { ...backend, outputPath: sj.outputPath };
    return {
      id: sj.id,
      status: 'pending' as const,
      file_path: sj.filePath,
      target_lang: sj.targetLang,
      preset: '',
      model: sj.model,
      total_lines: 0,
      processed_lines: 0,
      cached_lines: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      cost_usd: 0,
      created_at: new Date(sj.addedAt).toISOString(),
      updated_at: new Date(sj.addedAt).toISOString(),
      outputPath: sj.outputPath,
    };
  });

  const activeCount = jobs.filter(j => j.status === 'pending' || j.status === 'processing').length;

  // SSE listener for real-time progress updates
  useEffect(() => {
    if (!currentEvent || currentEvent.module !== 'translate') return;

    const jobId = currentEvent.data?.job_id;
    if (!jobId || !sessionIds.includes(jobId)) return;

    if (currentEvent.type === 'progress' && currentEvent.data?.percent !== undefined) {
      setLiveProgress(prev => ({ ...prev, [jobId]: currentEvent.data.percent }));
    }

    if (currentEvent.type === 'success' || currentEvent.type === 'error') {
      setLiveProgress(prev => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['session-jobs'] });
    }
  }, [currentEvent, queryClient, sessionIds]);

  const handleClearFinished = useCallback(() => {
    const finishedIds = jobs
      .filter(j => j.status === 'completed' || j.status === 'failed')
      .map(j => j.id);
    removeSessionJobs(finishedIds);
  }, [jobs]);

  const handleJobClick = (job: TranslationJob & { outputPath?: string }) => {
    setSelectedJobId(job.id);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: TranslationJob['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">{t('components.jobsPanel.pending')}</Badge>;
      case 'processing': return <Badge variant="info">{t('components.jobsPanel.processing')}</Badge>;
      case 'completed': return <Badge variant="success">{t('components.jobsPanel.completed')}</Badge>;
      case 'failed': return <Badge variant="error">{t('components.jobsPanel.failed')}</Badge>;
    }
  };

  const getJobProgress = (job: TranslationJob) => {
    if (job.id in liveProgress) return liveProgress[job.id];
    if (job.status === 'completed') return 100;
    if (job.total_lines > 0) return Math.round((job.processed_lines / job.total_lines) * 100);
    return 0;
  };

  const getProgressStatus = (status: TranslationJob['status']): 'active' | 'success' | 'error' => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'active';
    }
  };

  const fileName = (path: string) => path.split('/').pop() || path;

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <>
      <div className={styles.panelWrapper}>
        <button
          className={clsx(styles.tab, isOpen && styles.tabHidden)}
          onClick={() => setIsOpen(true)}
        >
          {t('components.jobsPanel.title')}
          {activeCount > 0 && (
            <span className={styles.tabBadge}>{activeCount}</span>
          )}
        </button>

        <div className={clsx(styles.panel, isOpen && styles.panelOpen)}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>{t('components.jobsPanel.title')}</h3>
            <div className={styles.panelActions}>
              <button className={styles.clearButton} onClick={handleClearFinished}>
                {t('components.jobsPanel.clear')}
              </button>
              <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.jobsList}>
            {jobs.length === 0 ? (
              <div className={styles.emptyState}>{t('components.jobsPanel.noJobs')}</div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className={styles.jobCard} onClick={() => handleJobClick(job)}>
                  <div className={styles.jobCardHeader}>
                    <span className={styles.jobFileName}>{fileName(job.file_path)}</span>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className={styles.jobMeta}>
                    <span>{job.target_lang}</span>
                    {job.total_lines > 0 && (
                      <span>
                        {t('components.jobsPanel.lines', {
                          processed: job.processed_lines,
                          total: job.total_lines,
                        })}
                      </span>
                    )}
                    {job.cost_usd > 0 && (
                      <span>${job.cost_usd.toFixed(4)}</span>
                    )}
                  </div>
                  {(job.status === 'pending' || job.status === 'processing') && (
                    <div className={styles.jobProgress}>
                      <ProgressBar
                        progress={getJobProgress(job)}
                        status={getProgressStatus(job.status)}
                        showValue={false}
                        animated={job.status === 'processing'}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

      <TranslationJobDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        jobId={selectedJobId}
        outputPath={selectedJob?.outputPath || selectedJob?.file_path}
        initialJobStatus={selectedJob?.status}
      />
    </>
  );
}
