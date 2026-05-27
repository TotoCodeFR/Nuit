import "./Divider.css";

type DividerProps = {
    vertical?: boolean;
};

export default function Divider({ vertical = false }: DividerProps) {
    return <div className={vertical ? "divider divider--vertical" : "divider"} />;
}
