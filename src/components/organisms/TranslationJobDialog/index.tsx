import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/organisms/Dialog';
import { Button, ProgressBar, CassetteTape, Typography } from '@/components/atoms';
import { useGlobalSSE } from '@/hooks';
import type { SSEEvent } from '@/types/api';
import styles from './TranslationJobDialog.module.css';

interface TranslationJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  outputPath?: string;
}

type JobStatus = 'starting' | 'translating' | 'completed' | 'failed';

export function TranslationJobDialog({ isOpen, onClose, jobId, outputPath }: TranslationJobDialogProps) {
  const { t } = useTranslation();
  const { currentEvent } = useGlobalSSE();

  const [status, setStatus] = useState<JobStatus>('starting');
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

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
      setStatus('starting');
      setProgress(0);
      setCurrentBatch(0);
      setTotalBatches(0);
      setStatusMessage(t('pages.translate.jobDialog.starting'));
    }
  }, [isOpen, jobId, t]);

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

            {status === 'completed' && outputPath && (
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
