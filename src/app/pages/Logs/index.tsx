import { useState } from "react";
import { Badge, PageTitle, Table, Typography } from "@/components/atoms";
import { useLogs } from "@/hooks/api/useLogs";
import styles from "./Logs.module.css";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";

export default function Logs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { t } = useTranslation();
  
  const { data: logsData, isFetching, isLoading, isError } = useLogs({ page, limit });

  if (isLoading && !logsData) return <Loading />;
  if (isError) return <div className={styles.container}>{t("pages.logs.error")}</div>;

  const totalPages = logsData ? Math.ceil(logsData.total / limit) : 1;

  return (
    <div className={styles.container}>
      <PageTitle titleKey="pages.logs.title" />
      <header className={styles.header}>
        <Typography variant="h2">{t("pages.logs.title")}</Typography>
        <Table.LimitSelector 
          value={limit} 
          onChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }} 
        />
      </header>

      <div className={styles.tableWrapper}>
        <Table >
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