import "./Textarea.css";

type TextareaProps = {
    id?: string;
    name?: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    maxLength?: number;
    error?: boolean;
    onChange: (value: string) => void;
};

export default function Textarea({
    id,
    name,
    value,
    placeholder,
    disabled = false,
    rows = 4,
    maxLength,
    error = false,
    onChange,
}: TextareaProps) {
    return (
        <textarea
            id={id}
            name={name}
            className={`textarea ${error ? "textarea--error" : ""}`.trim()}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            onChange={(event) => onChange(event.currentTarget.value)}
        />
    );
}
