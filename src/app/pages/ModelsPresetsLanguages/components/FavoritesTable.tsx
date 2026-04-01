import { useMemo, useState } from 'react';
import { Badge, Card, Table, Typography, Spinner } from '@/components/atoms';
import { useOpenRouter } from '@/hooks';
import { useTranslation } from 'react-i18next';
import styles from '../ModelsPresetsLanguages.module.css';

export const FavoritesTable = () => {
  const { t } = useTranslation();
  const { filteredModels, modelsQuery } = useOpenRouter();

  const [page, setPage] = useState(1);
  const limit = 10;

  const favoriteModels = useMemo(
    () => filteredModels.filter((m) => m.isFavorite),
    [filteredModels]
  );

  const totalItems = favoriteModels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const pageItems = favoriteModels.slice((page - 1) * limit, page * limit);

  return (
    <Card variant="secondary" className={styles.fullHeightCard}>
      <Card.Header>
        <Typography variant="h3" as="p">
          {t('pages.modelsPresetsLanguages.favoriteModels')}
        </Typography>
      </Card.Header>

      <Card.Content className={styles.content}>
        {modelsQuery.isLoading ? (
          <div className={styles.spinnerWrapper}>
            <Spinner />
          </div>
        ) : favoriteModels.length === 0 ? (
          <div className={styles.emptyState}>
            <Typography variant="muted">
              {t('pages.modelsPresetsLanguages.noFavoriteModels')}
            </Typography>
          </div>
        ) : (
          <>
            <div className={styles.tableScrollWrapper}>
              <Table>
                <Table.Header colWidths={[2, 1, 1, 1, 1]}>
                  <Table.Column>{t('pages.modelsPresetsLanguages.modelName')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.contextLength')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.inputPrice1M')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.outputPrice1M')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.moderated')}</Table.Column>
                </Table.Header>

                <Table.Body>
                  {pageItems.map((model) => (
                    <Table.Row key={model.id}>
                      <Table.Cell>{model.name}</Table.Cell>
                      <Table.Cell>{(model.contextLength / 1000).toFixed(0)}k</Table.Cell>
                      <Table.Cell>
                        {model.pricingInput1M > 0
                          ? `$${model.pricingInput1M.toFixed(2)}`
                          : t('pages.modelsPresetsLanguages.free')}
                      </Table.Cell>
                      <Table.Cell>
                        {model.pricingOutput1M > 0
                          ? `$${model.pricingOutput1M.toFixed(2)}`
                          : t('pages.modelsPresetsLanguages.free')}
                      </Table.Cell>
                      <Table.Cell>
                        {model.isModerated ? (
                          <Badge variant="danger">{t('common.yes')}</Badge>
                        ) : (
                          <Badge variant="success">{t('common.no')}</Badge>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Table.Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  currentCount={pageItems.length}
                  limit={limit}
                  isFetching={modelsQuery.isFetching}
                  onPageChange={(p) => setPage(Math.min(Math.max(p, 1), totalPages))}
                />
              </div>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
};

export default FavoritesTable;
