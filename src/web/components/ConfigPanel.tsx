import type { ModuleConfigField } from "../lib/configTypes";
import Button from "./Button";
import FieldLevelFeedback from "./FieldLevelFeedback";
import FormField from "./FormField";
import FormGroup from "./FormGroup";
import Input from "./Input";
import Select from "./Select";
import Textarea from "./Textarea";
import Toggle from "./Toggle";
import "./ConfigPanel.css";

type ConfigValue = string | number | boolean;

type ConfigPanelProps = {
    fields: ModuleConfigField[];
    values: Record<string, ConfigValue>;
    validationErrors?: Record<string, string>;
    fieldFeedback?: Record<string, string>;
    saving?: boolean;
    onChange: (key: string, value: ConfigValue) => void;
    onSave: () => void;
};

function getDefaultForField(field: ModuleConfigField): ConfigValue {
    if (field.default !== undefined) {
        return field.default;
    }

    if (field.type === "boolean") {
        return false;
    }

    return "";
}

function renderField(
    field: ModuleConfigField,
    values: Record<string, ConfigValue>,
    validationErrors: Record<string, string>,
    fieldFeedback: Record<string, string>,
    onChange: (key: string, value: ConfigValue) => void,
) {
    const rawValue = values[field.key] ?? getDefaultForField(field);
    const error = validationErrors[field.key];
    const feedback = fieldFeedback[field.key];
    const id = `field-${field.key}`;

    const maybeFeedback = feedback ? (
        <FieldLevelFeedback type="warning" message={feedback} />
    ) : null;

    if (field.type === "boolean") {
        return (
            <FormField
                id={id}
                label={field.label}
                helpText={field.description}
                optional={field.optional}
                error={error}
            >
                <div className="configPanel__toggleWrap">
                    <Toggle
                        id={id}
                        checked={Boolean(rawValue)}
                        onChange={(nextChecked) => onChange(field.key, nextChecked)}
                        label={Boolean(rawValue) ? "Enabled" : "Disabled"}
                    />
                    {maybeFeedback}
                </div>
            </FormField>
        );
    }

    if (field.type === "select") {
        return (
            <FormField
                id={id}
                label={field.label}
                helpText={field.description}
                optional={field.optional}
                error={error}
            >
                <div className="configPanel__fieldWrap">
                    <Select
                        id={id}
                        value={String(rawValue)}
                        placeholder={field.optional ? "No selection" : undefined}
                        options={field.options}
                        error={Boolean(error)}
                        onChange={(nextValue) => onChange(field.key, nextValue)}
                    />
                    {maybeFeedback}
                </div>
            </FormField>
        );
    }

    if (field.type === "number") {
        return (
            <FormField
                id={id}
                label={field.label}
                helpText={field.description}
                optional={field.optional}
                error={error}
            >
                <div className="configPanel__fieldWrap">
                    <Input
                        id={id}
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={String(rawValue)}
                        error={error}
                        onChange={(nextValue) => {
                            if (nextValue === "") {
                                onChange(field.key, "");
                                return;
                            }
                            const parsed = Number(nextValue);
                            onChange(
                                field.key,
                                Number.isNaN(parsed) ? "" : parsed,
                            );
                        }}
                    />
                    {maybeFeedback}
                </div>
            </FormField>
        );
    }

    const rawAsString = String(rawValue);
    const useTextarea =
        (field.type === "string" || field.type === "secret") &&
        typeof field.max === "number" &&
        field.max > 120;

    const placeholder =
        field.type === "channel"
            ? "Channel ID"
            : field.type === "role"
              ? "Role ID"
              : field.type === "user"
                ? "User ID"
                : undefined;

    return (
        <FormField
            id={id}
            label={field.label}
            helpText={field.description}
            optional={field.optional}
            error={error}
        >
            <div className="configPanel__fieldWrap">
                {useTextarea ? (
                    <Textarea
                        id={id}
                        value={rawAsString}
                        maxLength={field.max}
                        error={Boolean(error)}
                        onChange={(nextValue) => onChange(field.key, nextValue)}
                    />
                ) : (
                    <Input
                        id={id}
                        type={field.type === "secret" ? "password" : "text"}
                        value={rawAsString}
                        minLength={field.min}
                        maxLength={field.max}
                        autoComplete="off"
                        error={error}
                        placeholder={placeholder}
                        onChange={(nextValue) => onChange(field.key, nextValue)}
                    />
                )}
                {maybeFeedback}
            </div>
        </FormField>
    );
}

export default function ConfigPanel({
    fields,
    values,
    validationErrors = {},
    fieldFeedback = {},
    saving = false,
    onChange,
    onSave,
}: ConfigPanelProps) {
    const groups = new Map<string, ModuleConfigField[]>();

    for (const field of fields) {
        const groupName = field.group ?? "General";
        const current = groups.get(groupName);
        if (current) {
            current.push(field);
        } else {
            groups.set(groupName, [field]);
        }
    }

    if (fields.length === 0) {
        return (
            <section className="configPanel configPanel--empty">
                This module does not expose any configurable fields yet.
            </section>
        );
    }

    return (
        <section className="configPanel">
            <div className="configPanel__groups">
                {Array.from(groups.entries()).map(([group, groupedFields]) => (
                    <FormGroup key={group} title={group}>
                        {groupedFields.map((field) => (
                            <div
                                key={field.key}
                                className={`configPanel__field ${field.type === "string" && typeof field.max === "number" && field.max > 120 ? "configPanel__field--full" : ""}`.trim()}
                            >
                                {renderField(
                                    field,
                                    values,
                                    validationErrors,
                                    fieldFeedback,
                                    onChange,
                                )}
                            </div>
                        ))}
                    </FormGroup>
                ))}
            </div>
            <div className="configPanel__actions">
                <Button variant="primary" loading={saving} onClick={onSave}>
                    Save changes
                </Button>
            </div>
        </section>
    );
}
