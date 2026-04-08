import { Typography, Button, Badge } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from './TranslateFooter.module.css';

export interface TranslateFooterProps {
    selectedFile: string | null;
    selectedModelName: string;
    selectedPresetLabel: string;
    selectedLanguageName: string;
    removeSDH: boolean;
    canTranslate: boolean;
    isPending: boolean;
    buttonVariant: 'primary' | 'success' | 'error';
    buttonLabel: string;
    onTranslate: () => void;
}

export function TranslateFooter({
    selectedFile,
    selectedModelName,
    selectedPresetLabel,
    selectedLanguageName,
    removeSDH,
    canTranslate,
    isPending,
    buttonVariant,
    buttonLabel,
    onTranslate,
}: TranslateFooterProps) {
    const { t } = useTranslation();

    return (
        <div className={clsx(styles.footer, { [styles.footerCentered]: selectedFile })}>
            {selectedFile && (
                <div className={styles.selectedInfo}>
                    <Typography className={styles.truncateText} variant="muted">
                        <Typography variant="span" color="primary">{t('pages.translate.file')}</Typography> {selectedFile}
                    </Typography>
                    <div className={styles.selectedTranslateInfo}>
                        {selectedModelName && (
                            <Badge variant="success" className={styles.truncateLabel}>{selectedModelName}</Badge>
                        )}
                        {selectedPresetLabel && (
                            <Badge variant="secondary">{selectedPresetLabel}</Badge>
                        )}
                        {selectedLanguageName && (
                            <Badge variant="primary">{selectedLanguageName}</Badge>
                        )}
                        {removeSDH && (
                            <Badge variant="error">{t('pages.translate.removeSDH')}</Badge>
                        )}
                    </div>
                </div>
            )}
            <Button
                onClick={onTranslate}
                disabled={!canTranslate}
                loading={isPending}
                variant={buttonVariant}
            >
                {isPending ? t('pages.translate.translating') : buttonLabel}
            </Button>
        </div>
    );
}
