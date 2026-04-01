import { useState } from 'react';
import { Badge, Button, Card, IconButton, Input, Table, Textarea, Tooltip, Typography, Spinner } from '@/components/atoms';
import { Dialog } from '@/components/organisms';
import { usePresets, useToast } from '@/hooks';
import { type TranslationPreset } from '@/types';
import { Pencil, Trash2, Copy, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '../ModelsPresetsLanguages.module.css';

const DEFAULT_PRESET_IDS = [1, 2, 3, 4, 5, 6];

const emptyForm = {
  alias: '',
  name: '',
  system_prompt: '',
  batch_size: 1500,
  temperature: 0.3,
};

export const PresetsColumn = () => {
  const { t } = useTranslation();
  const { presets, isLoading, addPreset, updatePreset, deletePreset } = usePresets();
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TranslationPreset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [expandedPreset, setExpandedPreset] = useState<number | null>(null);

  const isDefault = (id: number) => DEFAULT_PRESET_IDS.includes(id);

  const toggleExpand = (id: number) => setExpandedPreset((prev) => (prev === id ? null : id));

  const openCreate = () => {
    setEditingPreset(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (preset: TranslationPreset) => {
    setEditingPreset(preset);
    setForm({
      alias: preset.alias,
      name: preset.name,
      system_prompt: preset.system_prompt,
      batch_size: preset.batch_size,
      temperature: preset.temperature,
    });
    setDialogOpen(true);
  };

  const openClone = (preset: TranslationPreset) => {
    setEditingPreset(null);
    setForm({
      alias: `${preset.alias}_copy`,
      name: `${preset.name} (${t('pages.modelsPresetsLanguages.copy')})`,
      system_prompt: preset.system_prompt,
      batch_size: preset.batch_size,
      temperature: preset.temperature,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.alias || !form.name || !form.system_prompt) {
      toast.error(t('pages.modelsPresetsLanguages.presetFormError'));
      return;
    }

    if (editingPreset) {
      updatePreset.mutate(
        { ...form, id: editingPreset.id },
        {
          onSuccess: () => {
            toast.success(t('pages.modelsPresetsLanguages.presetUpdated'));
            setDialogOpen(false);
          },
          onError: () => toast.error(t('pages.modelsPresetsLanguages.presetError')),
        }
      );
    } else {
      addPreset.mutate(form, {
        onSuccess: () => {
          toast.success(t('pages.modelsPresetsLanguages.presetAdded'));
          setDialogOpen(false);
        },
        onError: () => toast.error(t('pages.modelsPresetsLanguages.presetError')),
      });
    }
  };

  const handleDelete = (id: number) => {
    deletePreset.mutate(id, {
      onSuccess: () => {
        toast.success(t('pages.modelsPresetsLanguages.presetDeleted'));
        setConfirmDeleteId(null);
      },
      onError: () => toast.error(t('pages.modelsPresetsLanguages.presetError')),
    });
  };

  return (
    <>
      <Card variant="secondary" className={styles.fullHeightCard}>
        <Card.Header>
          <div className={styles.headerRow}>
            <Typography variant="h3" as="p">
              {t('pages.modelsPresetsLanguages.translationPresets')}
            </Typography>
            <Tooltip text={t('pages.modelsPresetsLanguages.addPreset')}>
              <IconButton onClick={openCreate} className={styles.addIconButton}>
                <Plus size={20} />
              </IconButton>
            </Tooltip>
          </div>
        </Card.Header>

        <Card.Content className={styles.content}>
          {isLoading ? (
            <div className={styles.spinnerWrapper}>
              <Spinner />
            </div>
          ) : (
            <div className={styles.tableScrollWrapper}>
              <Table>
                <Table.Header colWidths={[2, 2, 1, 1, 1]}>
                  <Table.Column>{t('pages.modelsPresetsLanguages.presetAlias')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.presetName')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.batchSize')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.temperature')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.actions')}</Table.Column>
                </Table.Header>

                <Table.Body>
                  {presets.map((preset) => (
                    <Table.ExpandableRow
                      key={preset.id}
                      isExpanded={expandedPreset === preset.id}
                      onToggle={() => toggleExpand(preset.id)}
                      mainContent={
                        <>
                          <Table.Cell>
                            <div className={styles.aliasCell}>
                              {preset.alias}
                              {isDefault(preset.id) && (
                                <Badge variant="secondary">{t('pages.modelsPresetsLanguages.default')}</Badge>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>{preset.name}</Table.Cell>
                          <Table.Cell>{preset.batch_size}</Table.Cell>
                          <Table.Cell>{preset.temperature}</Table.Cell>
                          <Table.Cell>
                            <div className={styles.actionButtons}>
                              {isDefault(preset.id) ? (
                                <Tooltip text={t('pages.modelsPresetsLanguages.clone')}>
                                  <IconButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); openClone(preset); }}>
                                    <Copy size={16} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <>
                                  <Tooltip text={t('common.edit')}>
                                    <IconButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); openEdit(preset); }}>
                                      <Pencil size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip text={t('common.delete')} variant="error">
                                    <IconButton onClick={(e: React.MouseEvent) => { e.stopPropagation(); setConfirmDeleteId(preset.id); }} className={styles.deleteIcon}>
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </Table.Cell>
                        </>
                      }
                      expandedContent={
                        <div className={styles.expandedContent}>
                          <Typography variant="small" weight="semibold">
                            {t('pages.modelsPresetsLanguages.systemPrompt')}
                          </Typography>
                          <Typography variant="small" className={styles.promptText}>
                            {preset.system_prompt}
                          </Typography>
                          <div className={styles.expandedBadges}>
                            <Badge variant="info">{t('pages.modelsPresetsLanguages.batchSize')}: {preset.batch_size}</Badge>
                            <Badge variant="info">{t('pages.modelsPresetsLanguages.temperature')}: {preset.temperature}</Badge>
                          </div>
                        </div>
                      }
                    />
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <Dialog.Header
          title={editingPreset
            ? t('pages.modelsPresetsLanguages.editPreset')
            : t('pages.modelsPresetsLanguages.addPreset')}
          onClose={() => setDialogOpen(false)}
        />
        <Dialog.Content>
          <div className={styles.presetForm}>
            <Input
              label={t('pages.modelsPresetsLanguages.presetAlias')}
              value={form.alias}
              onChange={(e) => setForm((f) => ({ ...f, alias: e.target.value }))}
            />
            <Input
              label={t('pages.modelsPresetsLanguages.presetName')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Textarea
              label={t('pages.modelsPresetsLanguages.systemPrompt')}
              value={form.system_prompt}
              onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
              rows={6}
            />
            <div className={styles.formRow}>
              <Input
                label={t('pages.modelsPresetsLanguages.batchSize')}
                type="number"
                value={String(form.batch_size)}
                onChange={(e) => setForm((f) => ({ ...f, batch_size: Number(e.target.value) }))}
              />
              <Input
                label={t('pages.modelsPresetsLanguages.temperature')}
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={String(form.temperature)}
                onChange={(e) => setForm((f) => ({ ...f, temperature: Number(e.target.value) }))}
              />
            </div>
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={addPreset.isPending || updatePreset.isPending}
          >
            {t('common.save')}
          </Button>
        </Dialog.Footer>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} size="sm">
        <Dialog.Header
          title={t('pages.modelsPresetsLanguages.confirmDelete')}
          onClose={() => setConfirmDeleteId(null)}
        />
        <Dialog.Content>
          <Typography variant="body">
            {t('pages.modelsPresetsLanguages.confirmDeleteMessage')}
          </Typography>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="error"
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            loading={deletePreset.isPending}
          >
            {t('common.delete')}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

export default PresetsColumn;
