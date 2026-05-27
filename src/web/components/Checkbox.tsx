import "./Checkbox.css";

type CheckboxProps = {
    id?: string;
    checked: boolean;
    label?: string;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
};

export default function Checkbox({
    id,
    checked,
    label,
    disabled = false,
    onChange,
}: CheckboxProps) {
    return (
        <label className={`checkbox ${disabled ? "checkbox--disabled" : ""}`.trim()}>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.currentTarget.checked)}
            />
            {label ? <span>{label}</span> : null}
        </label>
    );
}
