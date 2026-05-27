import { useMemo, useState } from "react";
import type { ModuleConfigField } from "../lib/configTypes";

type ConfigValue = string | number | boolean;

type UseModuleConfigState = {
    initialConfig: Record<string, ConfigValue>;
    schema: ModuleConfigField[];
};

function shallowEqual(
    first: Record<string, ConfigValue>,
    second: Record<string, ConfigValue>,
) {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    for (const key of firstKeys) {
        if (first[key] !== second[key]) {
            return false;
        }
    }

    return true;
}

export default function useModuleConfig(state: UseModuleConfigState) {
    const [values, setValues] = useState<Record<string, ConfigValue>>(
        state.initialConfig,
    );

    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    const hasUnsavedChanges = useMemo(
        () => !shallowEqual(values, state.initialConfig),
        [values, state.initialConfig],
    );

    function onChange(key: string, value: ConfigValue) {
        setValues((previous) => ({
            ...previous,
            [key]: value,
        }));
    }

    function reset() {
        setValues(state.initialConfig);
        setValidationErrors({});
    }

    function validate() {
        const nextErrors: Record<string, string> = {};

        for (const field of state.schema) {
            const value = values[field.key];
            const isEmpty = value === "" || value === undefined || value === null;

            if (!field.optional && isEmpty) {
                nextErrors[field.key] = "This field is required.";
                continue;
            }

            if (typeof value === "string") {
                if ("min" in field && typeof field.min === "number" && value.length < field.min) {
                    nextErrors[field.key] = `Must be at least ${String(field.min)} characters.`;
                }

                if ("max" in field && typeof field.max === "number" && value.length > field.max) {
                    nextErrors[field.key] = `Must be at most ${String(field.max)} characters.`;
                }
            }

            if (field.type === "number" && typeof value === "number") {
                if (typeof field.min === "number" && value < field.min) {
                    nextErrors[field.key] = `Must be greater than or equal to ${String(field.min)}.`;
                }
                if (typeof field.max === "number" && value > field.max) {
                    nextErrors[field.key] = `Must be lower than or equal to ${String(field.max)}.`;
                }
            }
        }

        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function toPayload() {
        const payload: Record<string, ConfigValue> = {};
        for (const [key, value] of Object.entries(values)) {
            if (value === "") continue;
            payload[key] = value;
        }
        return payload;
    }

    return {
        values,
        onChange,
        reset,
        validate,
        validationErrors,
        hasUnsavedChanges,
        toPayload,
    };
}
