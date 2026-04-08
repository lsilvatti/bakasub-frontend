import { useState } from "react";
import { Badge, PageTitle, Table, Tabs, Typography } from "@/components/atoms";
import { useLogs } from "@/hooks/api/useLogs";
import { useJobs } from "@/hooks/api/useJobs";
import styles from "./Logs.module.css";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import { BookOpenText, BriefcaseBusiness } from "lucide-react";

function LogsTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: logsData, isFetching, isLoading, isError } = useLogs({ page, limit });

  if (isLoading && !logsData) return <Loading />;
  if (isError) return <div>{t("pages.logs.error")}</div>;

  const totalPages = logsData ? Math.ceil(logsData.total / limit) : 1;

  return (
    <div className={styles.logContent}>
      <div className={styles.tableWrapper}>
        <Table>
          <Table.Header colWidths={[1, 1, 1, 1, undefined]}>
            <Table.Column>{t("pages.logs.columns.date")}</Table.Column>
            <Table.Column>{t("pages.logs.columns.level")}</Table.Column>
            <Table.Column>{t("pages.logs.columns.module")}</Table.Column>
            <Table.Column>{t("pages.logs.columns.message")}</Table.Column>
            <Table.Column aria-label={t("pages.logs.columns.expand")}>{null}</Table.Column>
          </Table.Header>
          <Table.Body>
            {logsData?.logs.map((log) => (
              <Table.ExpandableRow
                key={log.id}
                isExpanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                mainContent={
                  <>
                    <Table.Cell>
                      <Typography variant="small" color="secondary">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </Typography>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={log.level === 'ERROR' ? 'error' : 'secondary'}>
                        {log.level}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Typography weight="bold" variant="small">{log.module}</Typography>
                    </Table.Cell>
                    <Table.Cell>{log.message}</Table.Cell>
                  </>
                }
                expandedContent={
                  <pre className={styles.metadataPre}>
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                }
              />
            ))}
          </Table.Body>
        </Table>
      </div>
      <Table.Pagination
        page={page}
        totalPages={totalPages}
        totalItems={logsData?.total || 0}
        currentCount={logsData?.logs?.length || 0}
        limit={limit}
        isFetching={isFetching}
        onPageChange={setPage}
      />
    </div>
  );
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
  if (cost === 0) return '—';
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function JobsTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: jobsData, isFetching, isLoading, isError } = useJobs({ page, limit });

  if (isLoading && !jobsData) return <Loading />;
  if (isError) return <div>{t("pages.logs.jobs.error")}</div>;

  const totalPages = jobsData ? Math.ceil(jobsData.total / limit) : 1;

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'processing': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className={styles.logContent}>
      <div className={styles.tableWrapper}>
        <Table>
          <Table.Header colWidths={[2, 1, 1, 1, 1, 1, undefined]}>
            <Table.Column>{t("pages.logs.jobs.columns.file")}</Table.Column>
            <Table.Column>{t("pages.logs.jobs.columns.status")}</Table.Column>
            <Table.Column>{t("pages.logs.jobs.columns.language")}</Table.Column>
            <Table.Column>{t("pages.logs.jobs.columns.lines")}</Table.Column>
            <Table.Column>{t("pages.logs.jobs.columns.cost")}</Table.Column>
            <Table.Column>{t("pages.logs.jobs.columns.date")}</Table.Column>
            <Table.Column aria-label={t("pages.logs.columns.expand")}>{null}</Table.Column>
          </Table.Header>
          <Table.Body>
            {jobsData?.jobs.map((job) => {
              const fileName = job.file_path.split('/').pop() || job.file_path;
              const savingsPercent = job.total_lines > 0
                ? Math.round((job.cached_lines / job.total_lines) * 100)
                : 0;

              return (
                <Table.ExpandableRow
                  key={job.id}
                  isExpanded={expandedId === job.id}
                  onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                  mainContent={
                    <>
                      <Table.Cell>
                        <Typography variant="small" title={job.file_path}>{fileName}</Typography>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={statusVariant(job.status) as any}>
                          {t(`pages.logs.jobs.status.${job.status}`)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Typography variant="small">{job.target_lang}</Typography>
                      </Table.Cell>
                      <Table.Cell>
                        <Typography variant="small">
                          {job.processed_lines}/{job.total_lines}
                        </Typography>
                      </Table.Cell>
                      <Table.Cell>
                        <Typography variant="small">
                          {job.cost_usd > 0 ? formatCost(job.cost_usd) : t("pages.logs.jobs.free")}
                        </Typography>
                      </Table.Cell>
                      <Table.Cell>
                        <Typography variant="small" color="secondary">
                          {new Date(job.created_at).toLocaleString('pt-BR')}
                        </Typography>
                      </Table.Cell>
                    </>
                  }
                  expandedContent={
                    <div className={styles.jobDetails}>
                      <div className={styles.jobDetailsGrid}>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.model")}</span>
                          <span className={styles.jobDetailValue}>{job.model}</span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.preset")}</span>
                          <span className={styles.jobDetailValue}>{job.preset}</span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.totalLines")}</span>
                          <span className={styles.jobDetailValue}>{job.total_lines}</span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.translatedByAI")}</span>
                          <span className={styles.jobDetailValue}>{job.total_lines - job.cached_lines}</span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.fromMemory")}</span>
                          <span className={styles.jobDetailValue}>
                            {job.cached_lines}
                            {savingsPercent > 0 && (
                              <Badge variant="success" className={styles.savingsBadge}>{savingsPercent}%</Badge>
                            )}
                          </span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.tokens")}</span>
                          <span className={styles.jobDetailValue}>
                            {(job.prompt_tokens + job.completion_tokens).toLocaleString()}
                            <Typography variant="small" color="secondary">
                              ({job.prompt_tokens.toLocaleString()} in / {job.completion_tokens.toLocaleString()} out)
                            </Typography>
                          </span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.cost")}</span>
                          <span className={styles.jobDetailValue}>
                            {job.cost_usd > 0 ? formatCost(job.cost_usd) : t("pages.logs.jobs.free")}
                          </span>
                        </div>
                        <div className={styles.jobDetailItem}>
                          <span className={styles.jobDetailLabel}>{t("pages.logs.jobs.details.duration")}</span>
                          <span className={styles.jobDetailValue}>{formatDuration(job.created_at, job.updated_at)}</span>
                        </div>
                      </div>
                      {job.file_path && (
                        <div className={styles.jobFilePath}>
                          <Typography variant="small" color="secondary">{job.file_path}</Typography>
                        </div>
                      )}
                      {job.error_message && (
                        <div className={styles.jobError}>
                          <Typography variant="small" color="secondary">{job.error_message}</Typography>
                        </div>
                      )}
                    </div>
                  }
                />
              );
            })}
          </Table.Body>
        </Table>
      </div>
      <Table.Pagination
        page={page}
        totalPages={totalPages}
        totalItems={jobsData?.total || 0}
        currentCount={jobsData?.jobs?.length || 0}
        limit={limit}
        isFetching={isFetching}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function Logs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('logs');

  const tabs = [
    {
      id: 'logs',
      label: t("pages.logs.tabs.logs"),
      icon: <BookOpenText size={16} />,
    },
    {
      id: 'jobs',
      label: t("pages.logs.tabs.jobs"),
      icon: <BriefcaseBusiness size={16} />,
    },
  ];

  return (
    <div className={styles.container}>
      <PageTitle titleKey="pages.logs.title" />
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'jobs' && <JobsTab />}
      </Tabs>
    </div>
  );
}