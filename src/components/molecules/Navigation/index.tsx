import { NavItem } from '@/components/atoms';
import { useApiKeyRequirements, useToast, useVideoToolRequirements } from '@/hooks';
import { useAppRoute } from '@/hooks/useAppRoute';
import { APP_ROUTES } from '@/config/routes';
import { isSeparator } from '@/config/routeTypes';
import styles from './Navigation.module.css';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { RequiredApiKey } from '@/hooks/useApiKeyRequirements';

function getApiKeyLabel(key: RequiredApiKey, t: ReturnType<typeof useTranslation>['t']) {
    if (key === 'openrouter') {
        return t('pages.settings.apiKeys.openrouter');
    }

    return t('pages.settings.apiKeys.tmdb');
}

function formatMissingTools(tools: string[]) {
    return tools.map((tool) => tool === 'ffmpeg' ? 'FFmpeg' : tool).join(', ');
}

export function Navigation() {
    const { checkIsActive } = useAppRoute();
    const { t } = useTranslation();
    const toast = useToast();
    const { isLoading: isApiKeysLoading, getMissingKeys } = useApiKeyRequirements();
    const { isLoading: isToolsLoading, getMissingToolsForFeature } = useVideoToolRequirements();

    return (
        <nav className={styles.nav}>
            {APP_ROUTES.map((entry, index) => {
                if (isSeparator(entry)) {
                    return <hr key={`sep-${index}`} className={styles.separator} />;
                }
                if (!entry.showInSidebar) return null;

                const isLoading = isApiKeysLoading || isToolsLoading;
                const missingKeys = isLoading ? [] : getMissingKeys(entry.requiredApiKeys ?? []);
                const missingTools = isLoading ? [] : getMissingToolsForFeature(entry.videoFeature);
                const isLocked = missingKeys.length > 0 || missingTools.length > 0;

                const missingKeysLabel = missingKeys.map((key) => getApiKeyLabel(key, t)).join(', ');
                const missingToolsLabel = formatMissingTools(missingTools);
                return (
                    <div key={entry.path} className={styles.navItemGroup}>
                        <NavItem
                            to={entry.path}
                            data-active={checkIsActive(entry.path)}
                            disabled={isLocked}
                            onClick={isLocked ? () => {
                                if (missingKeys.length > 0) {
                                    toast.warning(
                                        t('pages.translate.apiKeysRequiredToast', { keys: missingKeysLabel }),
                                        t('pages.translate.apiKeysRequiredTitle')
                                    );
                                } else {
                                    const toastKey = entry.videoFeature === 'merge'
                                        ? 'pages.merge.videoToolsRequiredToast'
                                        : 'pages.extract.videoToolsRequiredToast';
                                    toast.warning(
                                        t(toastKey, { tools: missingToolsLabel }),
                                        t('pages.settings.videoTools.title')
                                    );
                                }
                            } : undefined}
                        >
                            {entry.icon && <entry.icon />}
                            {t(entry.title as ParseKeys)}
                        </NavItem>
                    </div>
                );
            })}
        </nav>
    );
}