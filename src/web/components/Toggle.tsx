import "./Toggle.css";

type ToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    disabled?: boolean;
    label?: string;
};

export default function Toggle({
    checked,
    onChange,
    id,
    disabled = false,
    label,
}: ToggleProps) {
    return (
        <label className={`toggle ${disabled ? "toggle--disabled" : ""}`.trim()}>
            <input
                id={id}
                className="toggle__input"
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.currentTarget.checked)}
            />
            <span className="toggle__rail" aria-hidden="true">
                <span className="toggle__thumb" />
            </span>
            {label ? <span className="toggle__label">{label}</span> : null}
        </label>
    );
}
