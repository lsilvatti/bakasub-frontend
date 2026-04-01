import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, IconButton, Table, Tooltip, Typography, Input, Select, Checkbox, Spinner } from "@/components/atoms";
import { useOpenRouter } from "@/hooks";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from '../ModelsPresetsLanguages.module.css';

export const ModelsColumn = () => {
    const { t } = useTranslation();
    const { modelsQuery, filteredModels, toggleFavorite, filters } = useOpenRouter();

    const [page, setPage] = useState(1);
    const limit = 20;
    const [hideModerated, setHideModerated] = useState(false);
    
    const [expandedModel, setExpandedModel] = useState<string | null>(null);

    const TRANSLATION_MIN_CONTEXT = 2048;
    const TRANSLATION_MIN_MAXOUTPUT = 512;

    useEffect(() => {
        setPage(1);
        setExpandedModel(null);
    }, [filters.searchQuery, filters.sortBy, filters.onlyFavorites, hideModerated, limit]);

    const displayed = useMemo(() => {
        let list = filteredModels || [];
        if (hideModerated) list = list.filter(m => !m.isModerated);
        list = list.filter(
            m => (m.contextLength || 0) >= TRANSLATION_MIN_CONTEXT && (m.maxOutput || 0) >= TRANSLATION_MIN_MAXOUTPUT
        );
        return list;
    }, [filteredModels, hideModerated]);

    const totalItems = displayed.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const pageItems = displayed.slice((page - 1) * limit, page * limit);

    const toggleExpand = (id: string) => setExpandedModel(prev => prev === id ? null : id);

    return (
        <Card variant="primary" className={styles.fullHeightCard}>
            <Card.Header>
                <div className={styles.headerControls}>
                    <Typography variant="h3" as="p">{t('pages.modelsPresetsLanguages.openRouterModels', 'Modelos OpenRouter')}</Typography>

                    <Input
                        placeholder={t('common.search', 'Pesquisar...')}
                        value={filters.searchQuery}
                        onChange={e => filters.setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />

                    <Select
                        options={[
                            { label: t('common.name', 'Nome (A-Z)'), value: 'name' },
                            { label: t('pages.modelsPresetsLanguages.sortPriceAsc'), value: 'price_asc' },
                            { label: t('pages.modelsPresetsLanguages.sortPriceDesc'), value: 'price_desc' },
                            { label: t('pages.modelsPresetsLanguages.sortContext'), value: 'context' },
                        ]}
                        value={filters.sortBy}
                        onChange={e => filters.setSortBy(e.target.value as any)}
                        className={styles.sortSelect}
                    />

                    <Checkbox
                        label={t('pages.modelsPresetsLanguages.onlyFavorites', 'Favoritos')}
                        checked={filters.onlyFavorites}
                        onChange={e => filters.setOnlyFavorites(e.target.checked)}
                    />

                    <Checkbox
                        label={t('pages.modelsPresetsLanguages.hideModerated', 'Ocultar Filtro NSFW')}
                        checked={hideModerated}
                        onChange={e => setHideModerated(e.target.checked)}
                    />


                </div>
            </Card.Header>

            <Card.Content className={styles.content}>
                {modelsQuery.isLoading ? (
                    <div className={styles.spinnerWrapper}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                      <div className={styles.tableScrollWrapper}>
                          <Table>
                            <Table.Header colWidths={[3, 1, 1, 1, 1, 1]}>
                                <Table.Column>{t('pages.modelsPresetsLanguages.modelName', 'Nome')}</Table.Column>
                                <Table.Column>{t('pages.modelsPresetsLanguages.contextLength', 'Contexto')}</Table.Column>
                                <Table.Column>{t('pages.modelsPresetsLanguages.inputPrice1M', 'In/1M')}</Table.Column>
                                <Table.Column>{t('pages.modelsPresetsLanguages.outputPrice1M', 'Out/1M')}</Table.Column>
                                <Table.Column>{t('pages.modelsPresetsLanguages.moderated', 'Restrito?')}</Table.Column>
                                <Table.Column>{t('pages.modelsPresetsLanguages.favorite', 'Fav')}</Table.Column>
                            </Table.Header>

                            <Table.Body>
                                {pageItems.map((model) => (
                                    <Table.ExpandableRow
                                        key={model.id}
                                        isExpanded={expandedModel === model.id}
                                        onToggle={() => toggleExpand(model.id)}
                                        mainContent={
                                            <>
                                                <Table.Cell>{model.name}</Table.Cell>
                                                <Table.Cell>{(model.contextLength / 1000).toFixed(0)}k</Table.Cell>
                                                <Table.Cell>{model.pricingInput1M > 0 ? `$${model.pricingInput1M.toFixed(2)}` : t('pages.modelsPresetsLanguages.free')}</Table.Cell>
                                                <Table.Cell>{model.pricingOutput1M > 0 ? `$${model.pricingOutput1M.toFixed(2)}` : t('pages.modelsPresetsLanguages.free')}</Table.Cell>
                                                <Table.Cell>
                                                    {model.isModerated ? (
                                                        <Badge variant="danger">{t('common.yes', 'Sim')}</Badge>
                                                    ) : (
                                                        <Badge variant="success">{t('common.no', 'Não')}</Badge>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Tooltip text={model.isFavorite ? t('pages.modelsPresetsLanguages.removeFavorite') : t('pages.modelsPresetsLanguages.addFavorite')}>
                                                        <IconButton
                                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(model.id); }}
                                                            className={model.isFavorite ? styles.starActive : styles.starInactive}
                                                        >
                                                            <Star fill={model.isFavorite ? "currentColor" : "none"} size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Table.Cell>
                                            </>
                                        }
                                        expandedContent={
                                            <div className={styles.expandedContent}>
                                                <Typography variant="small" color="secondary">{t('pages.modelsPresetsLanguages.technicalId')}: {model.id}</Typography>
                                                <Typography variant="body">{model.description || t('pages.modelsPresetsLanguages.noDescription')}</Typography>
                                                <div className={styles.expandedBadges}>
                                                    <Badge variant="secondary">{t('pages.modelsPresetsLanguages.maxOutput')}: {model.maxOutput} tokens</Badge>
                                                </div>
                                            </div>
                                        }
                                    />
                                ))}
                            </Table.Body>
                        </Table>
                      </div>

                        <div className={styles.paginationWrapper}>
                            <Table.Pagination
                                page={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                currentCount={pageItems.length}
                                limit={limit}
                                isFetching={modelsQuery.isFetching}
                                onPageChange={p => setPage(Math.min(Math.max(p, 1), totalPages))}
                            />
                        </div>
                    </>
                )}
            </Card.Content>
        </Card>
    );
};

export default ModelsColumn;