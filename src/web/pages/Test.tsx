import Button from "../components/Button";
import "../styles/global.css";
import "./Test.css";

export default function StyleTest() {
    return (
        <div>
            <h2>Buttons</h2>
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading={true}>
                Loading
            </Button>
            <Button variant="primary" disabled={true}>
                Disabled
            </Button>
        </div>
    );
}
