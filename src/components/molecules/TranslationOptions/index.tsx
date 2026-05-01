import { Select, Checkbox, Typography } from '@/components/atoms';
import { Textarea } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import styles from './TranslationOptions.module.css';

interface SelectOption {
    value: string;
    label: string;
}

export interface TranslationOptionsProps {
    context: string;
    disabled?: boolean;
    onContextChange: (value: string) => void;
    selectedModel: string;
    onModelChange: (value: string) => void;
    modelOptions: SelectOption[];
    modelsLoading?: boolean;
    selectedPreset: string;
    onPresetChange: (value: string) => void;
    presetOptions: SelectOption[];
    selectedLanguage: string;
    onLanguageChange: (value: string) => void;
    languageOptions: SelectOption[];
    removeSDH: boolean;
    onRemoveSDHChange: (value: boolean) => void;
}

export function TranslationOptions({
    context,
    disabled = false,
    onContextChange,
    selectedModel,
    onModelChange,
    modelOptions,
    modelsLoading = false,
    selectedPreset,
    onPresetChange,
    presetOptions,
    selectedLanguage,
    onLanguageChange,
    languageOptions,
    removeSDH,
    onRemoveSDHChange,
}: TranslationOptionsProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.metadataEditor}>
            <div className={styles.customMetadataSection}>
                <div>
                    <Typography variant="h3" as="p">{t('pages.translate.customMetadata')}</Typography>
                    <Typography variant="muted" className={styles.sectionDescription}>
                        {t('pages.translate.customMetadataDescription')}
                    </Typography>
                </div>
                <Textarea
                    placeholder={t('pages.translate.customMetadataPlaceholder')}
                    fullWidth
                    rows={4}
                    disabled={disabled}
                    value={context}
                    onChange={(e) => onContextChange(e.target.value)}
                />
            </div>
            <div className={styles.modelAndOptionsSection}>
                <div>
                    <Typography variant="h3" as="p">{t('pages.translate.translationOptions')}</Typography>
                    <Typography variant="muted" className={styles.sectionDescription}>
                        {t('pages.translate.translationOptionsDescription')}
                    </Typography>
                </div>
                <Select
                    label={t('pages.translate.modelLabel')}
                    placeholder={modelsLoading ? t('common.loading') : t('pages.translate.selectModel')}
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    options={modelOptions}
                    disabled={modelsLoading || disabled}
                    fullWidth
                />
                <Select
                    label={t('pages.translate.presetLabel')}
                    placeholder={t('pages.translate.selectPreset')}
                    value={selectedPreset}
                    onChange={(e) => onPresetChange(e.target.value)}
                    options={presetOptions}
                    disabled={disabled}
                    fullWidth
                />
                <Select
                    label={t('pages.translate.targetLanguage')}
                    placeholder={t('common.selectLanguage')}
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    options={languageOptions}
                    disabled={disabled}
                    fullWidth
                />
                <Checkbox
                    label={t('pages.translate.removeSDH')}
                    helperText={t('pages.translate.removeSDHHelp')}
                    checked={removeSDH}
                    disabled={disabled}
                    onChange={(e) => onRemoveSDHChange(e.target.checked)}
                />
            </div>
        </div>
    );
}
