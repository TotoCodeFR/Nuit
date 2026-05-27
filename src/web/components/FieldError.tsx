import "./FieldError.css";

type FieldErrorProps = {
    message: string;
};

export default function FieldError({ message }: FieldErrorProps) {
    return <p className="fieldError">{message}</p>;
}
