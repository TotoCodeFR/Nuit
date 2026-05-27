import "./FormGroup.css";

type FormGroupProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
};

export default function FormGroup({
    title,
    description,
    children,
}: FormGroupProps) {
    return (
        <section className="formGroup">
            <div className="formGroup__header">
                <h3>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <div className="formGroup__grid">{children}</div>
        </section>
    );
}
