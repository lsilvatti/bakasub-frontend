import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/organisms/Dialog';
import { Button, ProgressBar, CassetteTape, Typography, Badge } from '@/components/atoms';
import { useGlobalSSE } from '@/hooks';
import type { SSEEvent } from '@/types/api';
import styles from './TranslationJobDialog.module.css';

interface JobDetails {
  total_lines: number;
  processed_lines: number;
  cached_lines: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  model: string;
  created_at: string;
  updated_at: string;
}

interface TranslationJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  outputPath?: string;
  initialJobStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

type JobStatus = 'starting' | 'translating' | 'completed' | 'failed';

function mapBackendStatus(s?: string): JobStatus {
  switch (s) {
    case 'completed': return 'completed';
    case 'failed': return 'failed';
    case 'processing': return 'translating';
    default: return 'starting';
  }
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return '—';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remSecs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatCost(cost: number): string {
  if (cost === 0) return '';
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function TranslationJobDialog({ isOpen, onClose, jobId, outputPath, initialJobStatus }: TranslationJobDialogProps) {
  const { t } = useTranslation();
  const { currentEvent } = useGlobalSSE();

  const [status, setStatus] = useState<JobStatus>('starting');
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.module !== 'translate') return;
    if (event.data?.job_id && event.data.job_id !== jobId) return;

    switch (event.type) {
      case 'info':
        setStatus('starting');
        setStatusMessage(event.message);
        break;
      case 'progress':
        setStatus('translating');
        if (event.data?.percent !== undefined) {
          setProgress(event.data.percent);
        }
        if (event.data?.current !== undefined) {
          setCurrentBatch(event.data.current);
        }
        if (event.data?.total !== undefined) {
          setTotalBatches(event.data.total);
        }
        setStatusMessage(
          t('pages.translate.jobDialog.translatingBatch', {
            current: event.data?.current ?? 0,
            total: event.data?.total ?? 0,
          })
        );
        break;
      case 'success':
        setStatus('completed');
        setProgress(100);
        setStatusMessage(t('pages.translate.jobDialog.completed'));
        if (event.data) {
          setJobDetails({
            total_lines: event.data.total_lines ?? 0,
            processed_lines: event.data.processed_lines ?? 0,
            cached_lines: event.data.cached_lines ?? 0,
            prompt_tokens: event.data.prompt_tokens ?? 0,
            completion_tokens: event.data.completion_tokens ?? 0,
            cost_usd: event.data.cost_usd ?? 0,
            model: event.data.model ?? '',
            created_at: event.data.created_at ?? '',
            updated_at: event.data.updated_at ?? '',
          });
        }
        break;
      case 'error':
        setStatus('failed');
        setStatusMessage(event.message || t('pages.translate.jobDialog.failed'));
        break;
    }
  }, [jobId, t]);

  useEffect(() => {
    if (currentEvent) {
      handleSSEEvent(currentEvent);
    }
  }, [currentEvent, handleSSEEvent]);

  useEffect(() => {
    if (isOpen) {
      const mapped = mapBackendStatus(initialJobStatus);
      setStatus(mapped);
      setProgress(mapped === 'completed' ? 100 : 0);
      setCurrentBatch(0);
      setTotalBatches(0);
      setJobDetails(null);
      setStatusMessage(
        mapped === 'completed'
          ? t('pages.translate.jobDialog.completed')
          : mapped === 'failed'
            ? t('pages.translate.jobDialog.failed')
            : t('pages.translate.jobDialog.starting')
      );
    }
  }, [isOpen, jobId, initialJobStatus, t]);

  const memorySavingsPercent = useMemo(() => {
    if (!jobDetails || jobDetails.total_lines === 0) return 0;
    return Math.round((jobDetails.cached_lines / jobDetails.total_lines) * 100);
  }, [jobDetails]);

  const getDialogTitle = () => {
    switch (status) {
      case 'completed': return t('pages.translate.jobDialog.titleCompleted');
      case 'failed': return t('pages.translate.jobDialog.titleFailed');
      default: return t('pages.translate.jobDialog.title');
    }
  };

  const getCassetteStatus = (): 'active' | 'completed' | 'error' | 'idle' => {
    switch (status) {
      case 'starting': return 'active';
      case 'translating': return 'active';
      case 'completed': return 'completed';
      case 'failed': return 'error';
      default: return 'idle';
    }
  };

  const getProgressStatus = (): 'active' | 'success' | 'error' => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'active';
    }
  };

  const getCassetteSublabel = () => {
    if (status === 'translating' && totalBatches > 0) {
      return `${currentBatch}/${totalBatches}`;
    }
    if (status === 'completed') return t('pages.translate.jobDialog.sideB');
    return t('pages.translate.jobDialog.sideA');
  };

  const isFinished = status === 'completed' || status === 'failed';
  const isSpinning = status === 'starting' || status === 'translating';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm" closeOnOverlayClick={isFinished}>
      <Dialog.Header title={getDialogTitle()} onClose={isFinished ? onClose : undefined} />
      <Dialog.Content>
        <div className={styles.dialogContent}>
          <div className={styles.cassetteWrapper}>
            <CassetteTape
              label="BAKASUB"
              sublabel={getCassetteSublabel()}
              spinning={isSpinning}
              status={getCassetteStatus()}
            />
          </div>

          <div className={styles.statusSection}>
            <ProgressBar
              progress={progress}
              status={getProgressStatus()}
              animated={!isFinished}
              label={statusMessage}
            />

            {status === 'completed' && jobDetails && (
              <div className={styles.completionDetails}>
                {/* Memory savings banner */}
                {jobDetails.cached_lines > 0 && (
                  <div className={styles.savingsBanner}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span>{t('pages.translate.jobDialog.details.memorySavings', { percent: memorySavingsPercent })}</span>
                  </div>
                )}

                {/* Stats grid */}
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{jobDetails.total_lines.toLocaleString()}</span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.totalLines')}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{(jobDetails.total_lines - jobDetails.cached_lines).toLocaleString()}</span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.translatedByAI')}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {jobDetails.cached_lines.toLocaleString()}
                      {jobDetails.cached_lines > 0 && (
                        <Badge variant="success" className={styles.savingsBadge}>{memorySavingsPercent}%</Badge>
                      )}
                    </span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.fromMemory')}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatTokens(jobDetails.prompt_tokens + jobDetails.completion_tokens)}</span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.totalTokens')}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {jobDetails.cost_usd > 0 ? formatCost(jobDetails.cost_usd) : t('pages.translate.jobDialog.details.free')}
                    </span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.cost')}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatDuration(jobDetails.created_at, jobDetails.updated_at)}</span>
                    <span className={styles.statLabel}>{t('pages.translate.jobDialog.details.duration')}</span>
                  </div>
                </div>

                {/* Model tag */}
                {jobDetails.model && (
                  <div className={styles.modelTag}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                    </svg>
                    <span>{jobDetails.model}</span>
                  </div>
                )}

                {/* Token breakdown */}
                {(jobDetails.prompt_tokens > 0 || jobDetails.completion_tokens > 0) && (
                  <div className={styles.tokenBreakdown}>
                    <div className={styles.tokenRow}>
                      <span className={styles.tokenLabel}>{t('pages.translate.jobDialog.details.promptTokens')}</span>
                      <span className={styles.tokenValue}>{formatTokens(jobDetails.prompt_tokens)}</span>
                    </div>
                    <div className={styles.tokenRow}>
                      <span className={styles.tokenLabel}>{t('pages.translate.jobDialog.details.completionTokens')}</span>
                      <span className={styles.tokenValue}>{formatTokens(jobDetails.completion_tokens)}</span>
                    </div>
                  </div>
                )}

                {/* Output file */}
                {outputPath && (
                  <div className={styles.outputPath}>
                    <span className={styles.outputLabel}>{t('pages.translate.jobDialog.outputFile')}</span>{' '}
                    {outputPath}
                  </div>
                )}
              </div>
            )}

            {status === 'completed' && !jobDetails && outputPath && (
              <div className={styles.outputPath}>
                <span className={styles.outputLabel}>{t('pages.translate.jobDialog.outputFile')}</span>{' '}
                {outputPath}
              </div>
            )}

            {status === 'failed' && (
              <Typography variant="muted" className={styles.errorMessage}>
                {t('pages.translate.jobDialog.failed')}
              </Typography>
            )}

            {!isFinished && (
              <div className={styles.leaveWarning}>
                <svg className={styles.leaveWarningIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{t('pages.translate.jobDialog.leaveWarning')}</span>
              </div>
            )}
          </div>
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Button
          onClick={onClose}
          variant={status === 'completed' ? 'success' : 'primary'}
          className={styles.footerButton}
        >
          {t('pages.translate.jobDialog.close')}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
