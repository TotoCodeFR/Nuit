import "./Container.css";

type ContainerProps = {
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
};

export default function Container({ children, size = "lg" }: ContainerProps) {
    return <div className={`container container--${size}`}>{children}</div>;
}
