import { useState } from 'react';
import { Button, Card, IconButton, Input, Table, Tooltip, Typography, Spinner } from '@/components/atoms';
import { Dialog } from '@/components/organisms';
import { useLanguages, useToast } from '@/hooks';
import { type Language } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from '../ModelsPresetsLanguages.module.css';

export const LanguagesColumn = () => {
  const { t } = useTranslation();
  const { languages, isLoading, addLanguage, updateLanguage, deleteLanguage } = useLanguages();
  const toast = useToast();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [editForm, setEditForm] = useState({ code: '', name: '' });
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

  const openAddDialog = () => {
    setNewCode('');
    setNewName('');
    setAddDialogOpen(true);
  };

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) {
      toast.error(t('pages.modelsPresetsLanguages.langFormError'));
      return;
    }

    addLanguage.mutate(
      { code: newCode.trim(), name: newName.trim() },
      {
        onSuccess: () => {
          toast.success(t('pages.modelsPresetsLanguages.langAdded'));
          setAddDialogOpen(false);
        },
        onError: () => toast.error(t('pages.modelsPresetsLanguages.langError')),
      }
    );
  };

  const openEdit = (lang: Language) => {
    setEditingLang(lang);
    setEditForm({ code: lang.code, name: lang.name });
  };

  const handleUpdate = () => {
    if (!editingLang || !editForm.name.trim()) return;

    updateLanguage.mutate(
      { id: editingLang.id, code: editForm.code, name: editForm.name.trim() },
      {
        onSuccess: () => {
          toast.success(t('pages.modelsPresetsLanguages.langUpdated'));
          setEditingLang(null);
        },
        onError: () => toast.error(t('pages.modelsPresetsLanguages.langError')),
      }
    );
  };

  const handleDelete = (code: string) => {
    deleteLanguage.mutate(code, {
      onSuccess: () => {
        toast.success(t('pages.modelsPresetsLanguages.langDeleted'));
        setConfirmDeleteCode(null);
      },
      onError: () => toast.error(t('pages.modelsPresetsLanguages.langError')),
    });
  };

  return (
    <>
      <Card variant="primary" className={styles.fullHeightCard}>
        <Card.Header>
          <div className={styles.headerRow}>
            <Typography variant="h3" as="p">
              {t('pages.modelsPresetsLanguages.availableLanguages')}
            </Typography>
            <Tooltip text={t('pages.modelsPresetsLanguages.addLanguage')}>
              <IconButton onClick={openAddDialog} className={styles.addIconButton}>
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
                <Table.Header colWidths={[1, 4, 2]}>
                  <Table.Column>{t('pages.modelsPresetsLanguages.langCode')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.langName')}</Table.Column>
                  <Table.Column>{t('pages.modelsPresetsLanguages.actions')}</Table.Column>
                </Table.Header>

                <Table.Body>
                  {languages.map((lang) => (
                    <Table.Row key={lang.code}>
                      <Table.Cell>
                        <Typography variant="monospace">{lang.code}</Typography>
                      </Table.Cell>
                      <Table.Cell>{lang.name}</Table.Cell>
                      <Table.Cell>
                        <div className={styles.actionButtons}>
                          <Tooltip text={t('common.edit')}>
                            <IconButton onClick={() => openEdit(lang)}>
                              <Pencil size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip text={t('common.delete')} variant="error">
                            <IconButton onClick={() => setConfirmDeleteCode(lang.code)} className={styles.deleteIcon}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Add Language Dialog */}
      <Dialog isOpen={addDialogOpen} onClose={() => setAddDialogOpen(false)} size="sm">
        <Dialog.Header
          title={t('pages.modelsPresetsLanguages.addLanguage')}
          onClose={() => setAddDialogOpen(false)}
        />
        <Dialog.Content>
          <div className={styles.presetForm}>
            <Input
              label={t('pages.modelsPresetsLanguages.langCode')}
              placeholder="pt-BR, en, es..."
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Input
              label={t('pages.modelsPresetsLanguages.langName')}
              placeholder={t('pages.modelsPresetsLanguages.langNamePlaceholder')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            loading={addLanguage.isPending}
          >
            {t('common.add')}
          </Button>
        </Dialog.Footer>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editingLang !== null} onClose={() => setEditingLang(null)} size="sm">
        <Dialog.Header
          title={t('pages.modelsPresetsLanguages.editLanguage')}
          onClose={() => setEditingLang(null)}
        />
        <Dialog.Content>
          <div className={styles.presetForm}>
            <Input
              label={t('pages.modelsPresetsLanguages.langCode')}
              value={editForm.code}
              disabled
            />
            <Input
              label={t('pages.modelsPresetsLanguages.langName')}
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setEditingLang(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            loading={updateLanguage.isPending}
          >
            {t('common.save')}
          </Button>
        </Dialog.Footer>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={confirmDeleteCode !== null} onClose={() => setConfirmDeleteCode(null)} size="sm">
        <Dialog.Header
          title={t('pages.modelsPresetsLanguages.confirmDelete')}
          onClose={() => setConfirmDeleteCode(null)}
        />
        <Dialog.Content>
          <Typography variant="body">
            {t('pages.modelsPresetsLanguages.confirmDeleteLangMessage')}
          </Typography>
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setConfirmDeleteCode(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="error"
            onClick={() => confirmDeleteCode && handleDelete(confirmDeleteCode)}
            loading={deleteLanguage.isPending}
          >
            {t('common.delete')}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

export default LanguagesColumn;
