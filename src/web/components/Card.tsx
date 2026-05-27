import "./Card.css";

type CardProps = {
    children?: React.ReactNode;
    level?: 1 | 2 | 3 | 4;
    className?: string;
};

export default function Card({
    level = 1,
    className = "",
    children,
}: CardProps) {
    return (
        <div className={`card card--${String(level)} ${className}`.trim()}>
            {children}
        </div>
    );
}
