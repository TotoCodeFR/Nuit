import "./Stack.css";

type StackProps = {
    children: React.ReactNode;
    direction?: "row" | "column";
    gap?: "xs" | "sm" | "md" | "lg";
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "between";
    wrap?: boolean;
};

export default function Stack({
    children,
    direction = "column",
    gap = "md",
    align = "stretch",
    justify = "start",
    wrap = false,
}: StackProps) {
    return (
        <div
            className={`stack stack--${direction} stack--gap-${gap} stack--align-${align} stack--justify-${justify} ${wrap ? "stack--wrap" : ""}`.trim()}
        >
            {children}
        </div>
    );
}
