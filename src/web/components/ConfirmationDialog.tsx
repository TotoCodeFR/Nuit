import Button from "./Button";
import Card from "./Card";
import "./ConfirmationDialog.css";

type ConfirmationDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
};

export default function ConfirmationDialog({
    open,
    title,
    message,
    confirmText = "Confirm",
    onConfirm,
    onCancel,
    danger = false,
}: ConfirmationDialogProps) {
    if (!open) return null;

    return (
        <div className="confirmDialog" role="dialog" aria-modal="true">
            <div className="confirmDialog__backdrop" onClick={onCancel} />
            <Card className="confirmDialog__panel" level={3}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirmDialog__actions">
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant={danger ? "danger" : "primary"}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
