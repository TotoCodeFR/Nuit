import "./Input.css";
import FieldError from "./FieldError";

type InputProps = {
    id?: string;
    name?: string;
    type?: "text" | "number" | "password" | "search";
    value: string | number;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    autoComplete?: string;
    error?: string;
    onChange: (value: string) => void;
};

export default function Input({
    id,
    name,
    type = "text",
    value,
    placeholder,
    disabled = false,
    min,
    max,
    minLength,
    maxLength,
    autoComplete,
    error,
    onChange,
}: InputProps) {
    return (
        <div className="inputWrap">
            <input
                id={id}
                name={name}
                className={`input ${error ? "input--error" : ""}`.trim()}
                type={type}
                value={String(value)}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                minLength={minLength}
                maxLength={maxLength}
                autoComplete={autoComplete}
                onChange={(event) => onChange(event.currentTarget.value)}
            />
            {error ? <FieldError message={error} /> : null}
        </div>
    );
}
