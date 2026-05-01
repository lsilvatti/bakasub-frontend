import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PageTitle, Card, Input, Select, Switch, Button, Badge, Tabs } from "@/components/atoms";
import { Dialog } from "@/components/organisms";
import { useConfig, useHealthStatus, useOpenRouter, usePresets, useLanguages, useToast, useDebounce } from "@/hooks";
import { useTranslation } from "react-i18next";
import { useBlocker, useLocation } from "react-router-dom";
import clsx from "clsx";
import type { ExternalToolStatus, UserConfig } from "@/types";
import { validateOpenRouterApiKey, validateTmdbAccessToken } from "@/lib/apiKeyValidation";
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

type ApiKeyField = "openrouter" | "tmdb";
type ApiKeyValidationStatus = "idle" | "validating" | "valid" | "invalid";

interface ApiKeyValidationState {
    status: ApiKeyValidationStatus;
    checkedValue: string;
}

type ClientPlatform = "linux" | "windows" | "unknown";

const EMPTY_VALIDATION_STATE: ApiKeyValidationState = {
    status: "idle",
    checkedValue: "",
};

function detectClientPlatform(): ClientPlatform {
    if (typeof navigator === "undefined") {
        return "unknown";
    }

    const platformHint = `${navigator.userAgent ?? ""} ${navigator.platform ?? ""}`.toLowerCase();
    if (platformHint.includes("win")) {
        return "windows";
    }
    if (platformHint.includes("linux") || platformHint.includes("x11")) {
        return "linux";
    }

    return "unknown";
}

export default function Settings() {
    const { t } = useTranslation();
    const toast = useToast();
    const location = useLocation();

    const { config, isLoading, updateConfig } = useConfig();
    const { healthStatus, isLoading: isHealthLoading, isError: isHealthError } = useHealthStatus();
    const { favoriteModels } = useOpenRouter();
    const { presets } = usePresets();
    const { languages } = useLanguages();

    const [saved, setSaved] = useState<UserConfig>(EMPTY_CONFIG);
    const [form, setForm] = useState<UserConfig>(EMPTY_CONFIG);
    const [openRouterValidation, setOpenRouterValidation] = useState<ApiKeyValidationState>(EMPTY_VALIDATION_STATE);
    const [tmdbValidation, setTmdbValidation] = useState<ApiKeyValidationState>(EMPTY_VALIDATION_STATE);

    const debouncedOpenRouterKey = useDebounce(form.openrouter_api_key, 700);
    const debouncedTmdbToken = useDebounce(form.tmdb_access_token, 700);
    const openRouterRequestRef = useRef(0);
    const tmdbRequestRef = useRef(0);
    const videoToolsRef = useRef<HTMLDivElement>(null);
    const clientPlatform = useMemo(() => detectClientPlatform(), []);
    const [activeLinuxTab, setActiveLinuxTab] = useState("debian");
    const isVideoToolsSectionRequested = new URLSearchParams(location.search).get("section") === "video-tools";

    useEffect(() => {
        if (config) {
            setSaved(config);
            setForm(config);
            setOpenRouterValidation(EMPTY_VALIDATION_STATE);
            setTmdbValidation(EMPTY_VALIDATION_STATE);
        }
    }, [config]);

    useEffect(() => {
        if (!isVideoToolsSectionRequested) {
            return;
        }

        videoToolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        videoToolsRef.current?.focus();
    }, [isVideoToolsSectionRequested]);

    useEffect(() => {
        const normalizedValue = debouncedOpenRouterKey.trim();
        const savedValue = saved.openrouter_api_key.trim();

        if (!normalizedValue || normalizedValue === savedValue) {
            setOpenRouterValidation(EMPTY_VALIDATION_STATE);
            return;
        }

        const requestId = openRouterRequestRef.current + 1;
        openRouterRequestRef.current = requestId;

        setOpenRouterValidation({ status: "validating", checkedValue: normalizedValue });

        validateOpenRouterApiKey(normalizedValue)
            .then(() => {
                if (openRouterRequestRef.current !== requestId) {
                    return;
                }

                setOpenRouterValidation({ status: "valid", checkedValue: normalizedValue });
            })
            .catch(() => {
                if (openRouterRequestRef.current !== requestId) {
                    return;
                }

                setOpenRouterValidation({ status: "invalid", checkedValue: normalizedValue });
            });
    }, [debouncedOpenRouterKey, saved.openrouter_api_key]);

    useEffect(() => {
        const normalizedValue = debouncedTmdbToken.trim();
        const savedValue = saved.tmdb_access_token.trim();

        if (!normalizedValue || normalizedValue === savedValue) {
            setTmdbValidation(EMPTY_VALIDATION_STATE);
            return;
        }

        const requestId = tmdbRequestRef.current + 1;
        tmdbRequestRef.current = requestId;

        setTmdbValidation({ status: "validating", checkedValue: normalizedValue });

        validateTmdbAccessToken(normalizedValue)
            .then(() => {
                if (tmdbRequestRef.current !== requestId) {
                    return;
                }

                setTmdbValidation({ status: "valid", checkedValue: normalizedValue });
            })
            .catch(() => {
                if (tmdbRequestRef.current !== requestId) {
                    return;
                }

                setTmdbValidation({ status: "invalid", checkedValue: normalizedValue });
            });
    }, [debouncedTmdbToken, saved.tmdb_access_token]);

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

    const getApiKeyLabel = useCallback((field: ApiKeyField) => {
        if (field === "openrouter") {
            return t("pages.settings.apiKeys.openrouter");
        }

        return t("pages.settings.apiKeys.tmdb");
    }, [t]);

    const getMissingApiKeyLabels = useCallback((configState: Pick<UserConfig, "openrouter_api_key" | "tmdb_access_token">) => {
        const missing: string[] = [];

        if (!configState.openrouter_api_key.trim()) {
            missing.push(getApiKeyLabel("openrouter"));
        }

        if (!configState.tmdb_access_token.trim()) {
            missing.push(getApiKeyLabel("tmdb"));
        }

        return missing;
    }, [getApiKeyLabel]);

    const getApiKeyFeedback = useCallback((field: ApiKeyField, currentValue: string, savedValue: string, validation: ApiKeyValidationState) => {
        const normalizedCurrentValue = currentValue.trim();
        const normalizedSavedValue = savedValue.trim();

        if (!normalizedCurrentValue) {
            return {
                helperText: t("pages.settings.apiKeys.validation.required", { service: getApiKeyLabel(field) }),
                error: undefined,
                blocksSave: false,
            };
        }

        if (normalizedCurrentValue === normalizedSavedValue) {
            return {
                helperText: t("pages.settings.apiKeys.validation.configured"),
                error: undefined,
                blocksSave: false,
            };
        }

        if (validation.checkedValue !== normalizedCurrentValue) {
            return {
                helperText: t("pages.settings.apiKeys.validation.pending"),
                error: undefined,
                blocksSave: true,
            };
        }

        if (validation.status === "validating") {
            return {
                helperText: t("pages.settings.apiKeys.validation.validating"),
                error: undefined,
                blocksSave: true,
            };
        }

        if (validation.status === "valid") {
            return {
                helperText: t("pages.settings.apiKeys.validation.valid"),
                error: undefined,
                blocksSave: false,
            };
        }

        return {
            helperText: undefined,
            error: t(
                field === "openrouter"
                    ? "pages.settings.apiKeys.validation.invalidOpenRouter"
                    : "pages.settings.apiKeys.validation.invalidTmdb"
            ),
            blocksSave: true,
        };
    }, [getApiKeyLabel, t]);

    const openRouterFeedback = getApiKeyFeedback(
        "openrouter",
        form.openrouter_api_key,
        saved.openrouter_api_key,
        openRouterValidation
    );

    const tmdbFeedback = getApiKeyFeedback(
        "tmdb",
        form.tmdb_access_token,
        saved.tmdb_access_token,
        tmdbValidation
    );

    const savedMissingApiKeys = getMissingApiKeyLabels(saved);
    const hasAllFormApiKeys = Boolean(form.openrouter_api_key.trim()) && Boolean(form.tmdb_access_token.trim());
    const canSave = isDirty && !updateConfig.isPending && !openRouterFeedback.blocksSave && !tmdbFeedback.blocksSave;

    const handleSave = () => {
        const normalizedForm: UserConfig = {
            ...form,
            openrouter_api_key: form.openrouter_api_key.trim(),
            tmdb_access_token: form.tmdb_access_token.trim(),
        };

        updateConfig.mutate(normalizedForm, {
            onSuccess: () => {
                setSaved(normalizedForm);
                setForm(normalizedForm);
                setOpenRouterValidation(EMPTY_VALIDATION_STATE);
                setTmdbValidation(EMPTY_VALIDATION_STATE);
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
    const toolStatuses: Array<{ key: string; label: string; helpText: string; status: ExternalToolStatus }> = healthStatus
        ? [
            {
                key: "ffmpeg",
                label: "FFmpeg",
                helpText: t("pages.settings.videoTools.ffmpegMissingHelp"),
                status: healthStatus.videoTools.ffmpeg,
            },
            {
                key: "mkvmerge",
                label: "mkvmerge",
                helpText: t("pages.settings.videoTools.mkvmergeMissingHelp"),
                status: healthStatus.videoTools.mkvmerge,
            },
            {
                key: "mkvextract",
                label: "mkvextract",
                helpText: t("pages.settings.videoTools.mkvextractMissingHelp"),
                status: healthStatus.videoTools.mkvextract,
            },
        ]
        : [];
    const linuxDistros = [
        {
            id: "debian",
            label: "Debian / Ubuntu",
            command: t("pages.settings.videoTools.instructions.linuxCommand"),
        },
        {
            id: "fedora",
            label: "Fedora / RHEL",
            command: t("pages.settings.videoTools.instructions.fedoraCommand"),
        },
        {
            id: "arch",
            label: "Arch",
            command: t("pages.settings.videoTools.instructions.archCommand"),
        },
    ];
    const activeDistro = linuxDistros.find(d => d.id === activeLinuxTab) ?? linuxDistros[0];
    const isLinux = clientPlatform === "linux";
    const isWindows = clientPlatform === "windows";

    return (
        <div className={styles.container}>
            <PageTitle titleKey="pages.settings.title" />

            {savedMissingApiKeys.length > 0 && (
                <Card className={styles.requiredBanner}>
                    <Card.Header className={styles.requiredBannerHeader}>
                        <div className={styles.requiredBannerTitleRow}>
                            <Card.Title>{t("pages.settings.apiKeys.requiredBannerTitle")}</Card.Title>
                            <Badge variant="warning">{t("pages.translate.apiKeysRequiredTitle")}</Badge>
                        </div>
                        <Card.Description>
                            {hasAllFormApiKeys && isDirty
                                ? t("pages.settings.apiKeys.requiredBannerPendingSave")
                                : t("pages.settings.apiKeys.requiredBannerDescription", { keys: savedMissingApiKeys.join(", ") })}
                        </Card.Description>
                    </Card.Header>
                </Card>
            )}

            <div className={styles.grid}>

                <Card
                    ref={videoToolsRef}
                    id="video-tools"
                    tabIndex={-1}
                    className={clsx(styles.cardVideoTools, isVideoToolsSectionRequested && styles.cardVideoToolsFocused)}
                >
                    <Card.Header>
                        <Card.Title>{t("pages.settings.videoTools.title")}</Card.Title>
                        <Card.Description>{t("pages.settings.videoTools.description")}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {isHealthError ? (
                            <p className={styles.switchHelper}>{t("common.error")}</p>
                        ) : isHealthLoading || !healthStatus ? (
                            <p className={styles.switchHelper}>{t("common.loading")}</p>
                        ) : (
                            <div className={styles.fieldGroup}>
                                <div className={styles.toolsSummary}>
                                    <Badge variant={healthStatus.videoTools.videoProcessingAvailable ? "success" : "warning"}>
                                        {t(
                                            healthStatus.videoTools.videoProcessingAvailable
                                                ? "pages.settings.videoTools.ready"
                                                : "pages.settings.videoTools.missing"
                                        )}
                                    </Badge>
                                    <p className={styles.switchHelper}>
                                        {t(
                                            healthStatus.videoTools.videoProcessingAvailable
                                                ? "pages.settings.videoTools.readyDescription"
                                                : "pages.settings.videoTools.installHint"
                                        )}
                                    </p>
                                </div>

                                {toolStatuses.map((tool) => (
                                    <div key={tool.key} className={styles.toolRow}>
                                        <div className={styles.switchInfo}>
                                            <span className={styles.switchLabel}>{tool.label}</span>
                                            <span className={styles.switchHelper}>
                                                {tool.status.available
                                                    ? t("pages.settings.videoTools.detectedAt", { path: tool.status.path })
                                                    : tool.helpText}
                                            </span>
                                        </div>
                                        <Badge variant={tool.status.available ? "success" : "error"}>
                                            {t(
                                                tool.status.available
                                                    ? "pages.settings.videoTools.available"
                                                    : "pages.settings.videoTools.missingShort"
                                            )}
                                        </Badge>
                                    </div>
                                ))}

                                <div className={styles.instructionsSection}>
                                    <div className={styles.switchInfo}>
                                        <span className={styles.switchLabel}>{t("pages.settings.videoTools.instructions.title")}</span>
                                        <span className={styles.switchHelper}>{t("pages.settings.videoTools.instructions.description")}</span>
                                    </div>

                                    <div className={styles.instructionsGrid}>
                                        {/* Linux card */}
                                        <div className={clsx(styles.instructionCard, isLinux && styles.instructionCardRecommended)}>
                                            <div className={styles.instructionHeader}>
                                                <span className={styles.switchLabel}>{t("pages.settings.videoTools.instructions.linuxCardTitle")}</span>
                                                {isLinux && (
                                                    <Badge variant="info">{t("pages.settings.videoTools.instructions.recommended")}</Badge>
                                                )}
                                            </div>
                                            <Tabs
                                                tabs={linuxDistros.map(d => ({ id: d.id, label: d.label }))}
                                                activeTab={activeLinuxTab}
                                                onTabChange={setActiveLinuxTab}
                                                className={styles.distroTabs}
                                            >
                                                <ul className={styles.instructionList}>
                                                    <li>{t("pages.settings.videoTools.instructions.linuxStep1")}</li>
                                                    <li>{t("pages.settings.videoTools.instructions.linuxStep2")}</li>
                                                </ul>
                                                <code className={styles.codeBlock}>{activeDistro.command}</code>
                                            </Tabs>
                                        </div>

                                        {/* Windows card */}
                                        <div className={clsx(styles.instructionCard, isWindows && styles.instructionCardRecommended)}>
                                            <div className={styles.instructionHeader}>
                                                <span className={styles.switchLabel}>{t("pages.settings.videoTools.instructions.windowsTitle")}</span>
                                                {isWindows && (
                                                    <Badge variant="info">{t("pages.settings.videoTools.instructions.recommended")}</Badge>
                                                )}
                                            </div>
                                            <ul className={styles.instructionList}>
                                                <li>{t("pages.settings.videoTools.instructions.windowsStep1")}</li>
                                                <li>{t("pages.settings.videoTools.instructions.windowsStep2")}</li>
                                                <li>{t("pages.settings.videoTools.instructions.windowsStep3")}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card.Content>
                </Card>

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
                                helperText={openRouterFeedback.helperText}
                                error={openRouterFeedback.error}
                                placeholder="sk-or-..."
                                className={clsx(isModified("openrouter_api_key") && styles.fieldModified)}
                            />
                            <Input
                                label={t("pages.settings.apiKeys.tmdb")}
                                type="password"
                                value={form.tmdb_access_token}
                                onChange={e => handleChange("tmdb_access_token", e.target.value)}
                                helperText={tmdbFeedback.helperText}
                                error={tmdbFeedback.error}
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
                    disabled={!canSave}
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