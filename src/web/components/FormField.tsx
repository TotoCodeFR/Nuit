import FieldError from "./FieldError";
import "./FormField.css";

type FormFieldProps = {
    id?: string;
    label: string;
    helpText?: string;
    error?: string;
    optional?: boolean;
    required?: boolean;
    children: React.ReactNode;
};

export default function FormField({
    id,
    label,
    helpText,
    error,
    optional = false,
    required = false,
    children,
}: FormFieldProps) {
    return (
        <div className="formField">
            <div className="formField__head">
                <label className="formField__label" htmlFor={id}>
                    {label}
                </label>
                {optional ? <span className="formField__optional">Optional</span> : null}
                {required ? <span className="formField__required">Required</span> : null}
            </div>
            {children}
            {helpText ? <p className="formField__help">{helpText}</p> : null}
            {error ? <FieldError message={error} /> : null}
        </div>
    );
}
