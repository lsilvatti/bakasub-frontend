import { useState, useEffect, useCallback } from "react";
import { PageTitle, Card, Input, Select, Switch, Button } from "@/components/atoms";
import { Dialog } from "@/components/organisms";
import { useConfig, useOpenRouter, usePresets, useLanguages, useToast } from "@/hooks";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";
import clsx from "clsx";
import type { UserConfig } from "@/types";
import styles from "./Config.module.css";

const EMPTY_CONFIG: UserConfig = {
    default_model: "",
    default_preset: "",
    default_language: "",
    remove_sdh_default: false,
    video_timeout_minutes: 30,
    log_retention_days: 30,
    openrouter_api_key: "",
    tmdb_access_token: "",
    tmdb_metadata_enabled: true,
    concurrent_translations: 5,
    max_retries: 3,
    base_retry_delay: 2,
};

export default function Settings() {
    const { t } = useTranslation();
    const toast = useToast();

    const { config, isLoading, updateConfig } = useConfig();
    const { favoriteModels } = useOpenRouter();
    const { presets } = usePresets();
    const { languages } = useLanguages();

    const [saved, setSaved] = useState<UserConfig>(EMPTY_CONFIG);
    const [form, setForm] = useState<UserConfig>(EMPTY_CONFIG);

    useEffect(() => {
        if (config) {
            setSaved(config);
            setForm(config);
        }
    }, [config]);

    const isDirty = (Object.keys(form) as (keyof UserConfig)[]).some(
        key => form[key] !== saved[key]
    );

    const isModified = useCallback(
        (key: keyof UserConfig) => form[key] !== saved[key],
        [form, saved]
    );

    const handleChange = <K extends keyof UserConfig>(key: K, value: UserConfig[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateConfig.mutate(form, {
            onSuccess: () => {
                setSaved(form);
                toast.success(t("pages.settings.saved"));
            },
            onError: () => toast.error(t("pages.settings.error")),
        });
    };

    const blocker = useBlocker(isDirty);

    if (isLoading) return null;

    const modelOptions = favoriteModels.map(m => ({ label: m.name, value: m.id }));
    const presetOptions = presets.map(p => ({ label: p.name, value: p.alias }));
    const languageOptions = languages.map(l => ({ label: l.name, value: l.code }));

    return (
        <div className={styles.container}>
            <PageTitle titleKey="pages.settings.title" />

            <div className={styles.grid}>

                {/* Translation Defaults */}
                <Card className={styles.cardDefaults}>
                    <Card.Header>
                        <Card.Title>{t("pages.settings.defaults.title")}</Card.Title>
                        <Card.Description>{t("pages.settings.defaults.description")}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div className={styles.fieldGroup}>
                            <Select
                                label={t("pages.settings.defaults.model")}
                                options={modelOptions}
                                value={form.default_model}
                                onChange={e => handleChange("default_model", e.target.value)}
                                placeholder={t("pages.translate.selectModel")}
                                className={clsx(isModified("default_model") && styles.fieldModified)}
                            />
                            <div className={styles.row}>
                                <Select
                                    label={t("pages.settings.defaults.preset")}
                                    options={presetOptions}
                                    value={form.default_preset}
                                    onChange={e => handleChange("default_preset", e.target.value)}
                                    placeholder={t("pages.translate.selectPreset")}
                                    className={clsx(isModified("default_preset") && styles.fieldModified)}
                                />
                                <Select
                                    label={t("pages.settings.defaults.language")}
                                    options={languageOptions}
                                    value={form.default_language}
                                    onChange={e => handleChange("default_language", e.target.value)}
                                    placeholder={t("common.selectLanguage")}
                                    className={clsx(isModified("default_language") && styles.fieldModified)}
                                />
                            </div>
                            <div className={clsx(styles.switchRow, isModified("remove_sdh_default") && styles.switchRowModified)}>
                                <div className={styles.switchInfo}>
                                    <span className={styles.switchLabel}>{t("pages.settings.defaults.removeSDH")}</span>
                                    <span className={styles.switchHelper}>{t("pages.settings.defaults.removeSDHHelp")}</span>
                                </div>
                                <Switch
                                    checked={form.remove_sdh_default}
                                    onChange={e => handleChange("remove_sdh_default", e.target.checked)}
                                />
                            </div>
                            <div className={clsx(styles.switchRow, isModified("tmdb_metadata_enabled") && styles.switchRowModified)}>
                                <div className={styles.switchInfo}>
                                    <span className={styles.switchLabel}>{t("pages.settings.defaults.tmdbMetadata")}</span>
                                    <span className={styles.switchHelper}>{t("pages.settings.defaults.tmdbMetadataHelp")}</span>
                                </div>
                                <Switch
                                    checked={form.tmdb_metadata_enabled}
                                    onChange={e => handleChange("tmdb_metadata_enabled", e.target.checked)}
                                />
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                {/* API Keys */}
                <Card className={styles.cardApiKeys}>
                    <Card.Header>
                        <Card.Title>{t("pages.settings.apiKeys.title")}</Card.Title>
                        <Card.Description>{t("pages.settings.apiKeys.description")}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div className={styles.fieldGroup}>
                            <Input
                                label={t("pages.settings.apiKeys.openrouter")}
                                type="password"
                                value={form.openrouter_api_key}
                                onChange={e => handleChange("openrouter_api_key", e.target.value)}
                                placeholder="sk-or-..."
                                className={clsx(isModified("openrouter_api_key") && styles.fieldModified)}
                            />
                            <Input
                                label={t("pages.settings.apiKeys.tmdb")}
                                type="password"
                                value={form.tmdb_access_token}
                                onChange={e => handleChange("tmdb_access_token", e.target.value)}
                                placeholder="eyJ..."
                                className={clsx(isModified("tmdb_access_token") && styles.fieldModified)}
                            />
                        </div>
                    </Card.Content>
                </Card>

                {/* Maintenance */}
                <Card className={styles.cardMaintenance}>
                    <Card.Header>
                        <Card.Title>{t("pages.settings.maintenance.title")}</Card.Title>
                        <Card.Description>{t("pages.settings.maintenance.description")}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div className={styles.fieldGroup}>
                            <Input
                                label={t("pages.settings.maintenance.logRetention")}
                                type="number"
                                min={1}
                                max={365}
                                value={form.log_retention_days}
                                onChange={e => handleChange("log_retention_days", Number(e.target.value))}
                                helperText={t("pages.settings.maintenance.logRetentionHelp")}
                                className={clsx(isModified("log_retention_days") && styles.fieldModified)}
                            />
                        </div>
                    </Card.Content>
                </Card>

                {/* Performance */}
                <Card className={styles.cardPerformance}>
                    <Card.Header>
                        <Card.Title>{t("pages.settings.performance.title")}</Card.Title>
                        <Card.Description>{t("pages.settings.performance.description")}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div className={styles.fieldGroup}>
                            <div className={styles.row}>
                                <Input
                                    label={t("pages.settings.performance.concurrent")}
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={form.concurrent_translations}
                                    onChange={e => handleChange("concurrent_translations", Number(e.target.value))}
                                    className={clsx(isModified("concurrent_translations") && styles.fieldModified)}
                                />
                                <Input
                                    label={t("pages.settings.performance.maxRetries")}
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={form.max_retries}
                                    onChange={e => handleChange("max_retries", Number(e.target.value))}
                                    className={clsx(isModified("max_retries") && styles.fieldModified)}
                                />
                            </div>
                            <div className={styles.row}>
                                <Input
                                    label={t("pages.settings.performance.retryDelay")}
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={form.base_retry_delay}
                                    onChange={e => handleChange("base_retry_delay", Number(e.target.value))}
                                    helperText={t("pages.settings.performance.retryDelayHelp")}
                                    className={clsx(isModified("base_retry_delay") && styles.fieldModified)}
                                />
                                <Input
                                    label={t("pages.settings.performance.videoTimeout")}
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={form.video_timeout_minutes}
                                    onChange={e => handleChange("video_timeout_minutes", Number(e.target.value))}
                                    helperText={t("pages.settings.performance.videoTimeoutHelp")}
                                    className={clsx(isModified("video_timeout_minutes") && styles.fieldModified)}
                                />
                            </div>
                        </div>
                    </Card.Content>
                </Card>

            </div>

            {/* Save Button */}
            <div className={styles.footer}>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={updateConfig.isPending}
                    disabled={!isDirty}
                >
                    {t("common.save")}
                </Button>
            </div>

            {/* Unsaved changes blocker */}
            <Dialog
                isOpen={blocker.state === "blocked"}
                onClose={() => blocker.reset?.()}
                size="sm"
                closeOnOverlayClick={false}
            >
                <Dialog.Header title={t("pages.settings.unsavedTitle")} onClose={() => blocker.reset?.()} />
                <Dialog.Content>
                    <p>{t("pages.settings.unsavedMessage")}</p>
                </Dialog.Content>
                <Dialog.Footer>
                    <Button variant="ghost" onClick={() => blocker.reset?.()}>
                        {t("common.cancel")}
                    </Button>
                    <Button variant="error" onClick={() => blocker.proceed?.()}>
                        {t("pages.settings.discardChanges")}
                    </Button>
                </Dialog.Footer>
            </Dialog>
        </div>
    );
}