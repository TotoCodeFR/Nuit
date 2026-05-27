import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import ConfigPanel from "../components/ConfigPanel";
import ConfirmationDialog from "../components/ConfirmationDialog";
import Container from "../components/Container";
import UnsavedChangesIndicator from "../components/UnsavedChangesIndicator";
import useAuth from "../hooks/useAuth";
import useModuleConfig from "../hooks/useModuleConfig";
import { api } from "../lib/api";
import type { ModuleConfigResponse, ModuleOverview } from "../lib/configTypes";
import "./ModuleConfig.css";

function formatDate(value: string | null) {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function ModuleConfig() {
    const { guildId, moduleId } = useParams();
    const resolvedGuildId = guildId ?? "";
    const resolvedModuleId = moduleId ?? "";

    const { user, loading: authLoading } = useAuth();

    const [data, setData] = useState<ModuleConfigResponse | null>(null);
    const [moduleMeta, setModuleMeta] = useState<ModuleOverview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);

    const configState = useModuleConfig({
        initialConfig: data?.config ?? {},
        schema: data?.schema ?? [],
    });

    useEffect(() => {
        if (!resolvedGuildId || !resolvedModuleId) return;

        let active = true;
        setLoading(true);
        setError(null);

        Promise.all([
            api.getModuleConfig(resolvedGuildId, resolvedModuleId),
            api.getGuildModules(resolvedGuildId),
        ])
            .then(([moduleConfig, allModules]) => {
                if (!active) return;
                setData(moduleConfig);
                setModuleMeta(
                    allModules.find((module) => module.id === resolvedModuleId) ??
                        null,
                );
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load module config",
                );
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [resolvedGuildId, resolvedModuleId]);

    const fieldFeedback = useMemo(() => {
        const feedback: Record<string, string> = {};
        for (const field of data?.schema ?? []) {
            if (field.type === "channel") {
                feedback[field.key] =
                    "Use a Discord channel snowflake ID (17-20 digits).";
            }
            if (field.type === "role") {
                feedback[field.key] =
                    "Use a Discord role snowflake ID (17-20 digits).";
            }
            if (field.type === "user") {
                feedback[field.key] =
                    "Use a Discord user snowflake ID (17-20 digits).";
            }
        }
        return feedback;
    }, [data?.schema]);

    async function onSave() {
        if (!data) return;
        if (!configState.validate()) return;

        setSaving(true);
        try {
            const response = await api.updateModuleConfig(
                resolvedGuildId,
                data.module,
                configState.toPayload(),
            );
            setData(response);
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Failed to save module config",
            );
        } finally {
            setSaving(false);
        }
    }

    async function onToggleEnabled(nextEnabled: boolean) {
        if (!data) return;

        if (
            moduleMeta?.kind === "essential" &&
            data.enabled &&
            !nextEnabled
        ) {
            setShowDisableDialog(true);
            return;
        }

        const result = await api.toggleModuleEnabled(
            resolvedGuildId,
            data.module,
            nextEnabled,
        );
        setData({
            ...data,
            enabled: result.enabled,
            updatedAt: result.updatedAt,
        });
    }

    async function confirmDisableEssential() {
        if (!data) return;
        const result = await api.toggleModuleEnabled(
            resolvedGuildId,
            data.module,
            false,
        );
        setData({
            ...data,
            enabled: result.enabled,
            updatedAt: result.updatedAt,
        });
        setShowDisableDialog(false);
    }

    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    if (!resolvedGuildId || !resolvedModuleId) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <main className="moduleConfigPage">
            <Container size="lg">
                <section className="moduleConfigHeader">
                    <Link
                        className="moduleConfigBack"
                        to={`/dashboard/${resolvedGuildId}/overview`}
                    >
                        Back to overview
                    </Link>
                    <p className="moduleConfigEyebrow">Module configuration</p>
                    <h1>{moduleMeta?.name ?? resolvedModuleId}</h1>
                    <p className="moduleConfigSubtitle">
                        Edit this module&apos;s guild-specific settings.
                    </p>
                </section>

                {loading ? <p>Loading module configuration...</p> : null}
                {error ? <p className="moduleConfigError">{error}</p> : null}

                {data ? (
                    <>
                        <section className="moduleConfigSummary">
                            <Card level={2}>
                                <p>Module</p>
                                <strong>{data.module}</strong>
                            </Card>
                            <Card level={2}>
                                <p>Status</p>
                                <strong>{data.enabled ? "Enabled" : "Disabled"}</strong>
                            </Card>
                            <Card level={2}>
                                <p>Last update</p>
                                <strong>{formatDate(data.updatedAt)}</strong>
                            </Card>
                            <Card level={2} className="moduleConfigStatusToggle">
                                <button
                                    type="button"
                                    onClick={() => onToggleEnabled(!data.enabled)}
                                    className="moduleConfigToggleButton"
                                >
                                    {data.enabled ? "Disable" : "Enable"}
                                </button>
                            </Card>
                        </section>

                        <section>
                            <ConfigPanel
                                fields={data.schema}
                                values={configState.values}
                                validationErrors={configState.validationErrors}
                                fieldFeedback={fieldFeedback}
                                saving={saving}
                                onChange={configState.onChange}
                                onSave={onSave}
                            />
                        </section>

                        <UnsavedChangesIndicator
                            visible={configState.hasUnsavedChanges}
                            saving={saving}
                            onDiscard={configState.reset}
                            onSave={onSave}
                        />

                        <ConfirmationDialog
                            open={showDisableDialog}
                            title="Disable essential module?"
                            message="This module is marked essential and disabling it may impact dependent features."
                            confirmText="Disable"
                            danger
                            onCancel={() => setShowDisableDialog(false)}
                            onConfirm={confirmDisableEssential}
                        />
                    </>
                ) : null}
            </Container>
        </main>
    );
}
