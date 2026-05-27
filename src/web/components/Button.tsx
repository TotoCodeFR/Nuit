import "./Button.css";
import "../styles/global.css";

type ButtonProps = {
    variant?: "primary" | "ghost" | "danger";
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
};

export default function Button({
    variant = "primary",
    disabled = false,
    loading = false,
    onClick,
    children,
}: ButtonProps) {
    return (
        <button
            className={`btn btn--${variant}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? <span className="btn__spinner" /> : children}
        </button>
    );
}
