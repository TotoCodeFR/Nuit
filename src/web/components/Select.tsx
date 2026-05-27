import "./Select.css";

type SelectProps = {
    id?: string;
    name?: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
};

export default function Select({
    id,
    name,
    value,
    placeholder,
    disabled = false,
    error = false,
    options,
    onChange,
}: SelectProps) {
    return (
        <select
            id={id}
            name={name}
            className={`select ${error ? "select--error" : ""}`.trim()}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.value)}
        >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
