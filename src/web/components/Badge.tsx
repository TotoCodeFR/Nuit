import "./Badge.css";

type BadgeProps = {
    variant?: "default" | "success" | "warning" | "danger" | "info";
    label: string;
    icon?: React.ReactNode;
};

export default function Badge({
    variant = "default",
    label,
    icon,
}: BadgeProps) {
    return (
        <div className={`badge badge--${variant}`}>
            {icon}
            <p>{label}</p>
        </div>
    );
}
