import "./FieldLevelFeedback.css";

type FieldLevelFeedbackProps = {
    message: string;
    type?: "conflict" | "warning" | "info";
};

export default function FieldLevelFeedback({
    message,
    type = "info",
}: FieldLevelFeedbackProps) {
    return <p className={`fieldFeedback fieldFeedback--${type}`}>{message}</p>;
}
