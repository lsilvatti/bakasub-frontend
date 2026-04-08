import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/organisms/Dialog';
import { Button, Typography, Badge, Spinner } from '@/components/atoms';
import type { PreflightResult } from '@/types';
import styles from './PreflightDialog.module.css';

export interface PreflightDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: PreflightResult | null;
    isLoading: boolean;
    isError: boolean;
    context: string;
    modelName: string;
    onTranslate?: () => void;
}

function formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

function formatCost(cost: number): string {
    if (cost === 0) return '';
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    return `$${cost.toFixed(4)}`;
}

export function PreflightDialog({
    isOpen,
    onTranslate,
    onClose,
    data,
    isLoading,
    isError,
    context,
    modelName,
}: PreflightDialogProps) {
    const { t } = useTranslation();

    const memorySavingsPercent = data && data.total_lines > 0
        ? Math.round((data.cached_lines / data.total_lines) * 100)
        : 0;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size="lg">
            <Dialog.Header title={t('pages.translate.preflight.title')} onClose={onClose} />
            <Dialog.Content>
                {isLoading && (
                    <div className={styles.loadingState}>
                        <Spinner />
                        <Typography variant="muted">{t('pages.translate.preflight.loading')}</Typography>
                    </div>
                )}

                {isError && (
                    <div className={styles.errorState}>
                        <Typography variant="body" color="error">{t('pages.translate.preflight.error')}</Typography>
                    </div>
                )}

                {data && !isLoading && (
                    <div className={styles.preflightContent}>
                        {/* Disclaimer */}
                        <div className={styles.disclaimer}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>{t('pages.translate.preflight.disclaimer')}</span>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{data.total_lines.toLocaleString()}</span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.totalLines')}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{data.lines_to_translate.toLocaleString()}</span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.linesToTranslate')}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {data.cached_lines.toLocaleString()}
                                    {data.cached_lines > 0 && (
                                        <Badge variant="success" className={styles.savingsBadge}>{memorySavingsPercent}%</Badge>
                                    )}
                                </span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.cachedLines')}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{data.total_batches}</span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.batches')}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{formatTokens(data.estimated_tokens)}</span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.estimatedTokens')}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {data.is_free_model
                                        ? t('pages.translate.preflight.free')
                                        : data.estimated_cost_usd > 0
                                            ? formatCost(data.estimated_cost_usd)
                                            : '—'}
                                </span>
                                <span className={styles.statLabel}>{t('pages.translate.preflight.estimatedCost')}</span>
                            </div>
                        </div>

                        {/* Translation Details */}
                        <div className={styles.detailsSection}>
                            <Typography variant="h3" as="p" className={styles.sectionTitle}>
                                {t('pages.translate.preflight.translationDetails')}
                            </Typography>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>{t('pages.translate.preflight.model')}</span>
                                    <span className={styles.detailValue}>{modelName}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>{t('pages.translate.preflight.preset')}</span>
                                    <span className={styles.detailValue}>{data.preset_name}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>{t('pages.translate.preflight.targetLanguage')}</span>
                                    <span className={styles.detailValue}>{data.target_language}</span>
                                </div>
                                {data.source_language && (
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>{t('pages.translate.preflight.sourceLanguage')}</span>
                                        <span className={styles.detailValue}>{data.source_language}</span>
                                    </div>
                                )}
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>{t('pages.translate.preflight.batchSize')}</span>
                                    <span className={styles.detailValue}>{data.batch_size} {t('pages.translate.preflight.chars')}</span>
                                </div>
                                {data.is_free_model && (
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>{t('pages.translate.preflight.modelType')}</span>
                                        <Badge variant="success">{t('pages.translate.preflight.free')}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Media Context */}
                        {context && (
                            <div className={styles.detailsSection}>
                                <Typography variant="h3" as="p" className={styles.sectionTitle}>
                                    {t('pages.translate.preflight.mediaContext')}
                                </Typography>
                                <pre className={styles.promptBlock}>{context}</pre>
                            </div>
                        )}

                        {/* System Prompt */}
                        <div className={styles.detailsSection}>
                            <Typography variant="h3" as="p" className={styles.sectionTitle}>
                                {t('pages.translate.preflight.systemPrompt')}
                            </Typography>
                            <pre className={styles.promptBlock}>{data.system_prompt}</pre>
                        </div>
                    </div>
                )}
            </Dialog.Content>
            <Dialog.Footer>
                <Button variant="ghost" onClick={onClose}>
                    {t('common.close')}
                </Button>
                {onTranslate && data && !isLoading && (
                    <Button variant="primary" onClick={() => { onTranslate(); onClose(); }}>
                        {t('pages.translate.startTranslation')}
                    </Button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
}
