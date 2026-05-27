import Button from "./Button";
import "./UnsavedChangesIndicator.css";

type UnsavedChangesIndicatorProps = {
    visible: boolean;
    saving?: boolean;
    onSave: () => void;
    onDiscard: () => void;
};

export default function UnsavedChangesIndicator({
    visible,
    saving = false,
    onSave,
    onDiscard,
}: UnsavedChangesIndicatorProps) {
    if (!visible) return null;

    return (
        <div className="unsavedBar">
            <p>You have unsaved changes.</p>
            <div className="unsavedBar__actions">
                <Button variant="ghost" onClick={onDiscard} disabled={saving}>
                    Discard
                </Button>
                <Button variant="primary" onClick={onSave} loading={saving}>
                    Save changes
                </Button>
            </div>
        </div>
    );
}
