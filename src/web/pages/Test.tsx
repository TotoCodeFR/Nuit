import Button from "../components/Button";
import ServerIcon from "../components/ServerIcon";
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
            <h2>Server Icon</h2>
            <ServerIcon
                iconUrl="https://images.unsplash.com/photo-1779332317860-ddf6f5ee74a2?w=48&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8"
                name="Hello"
            ></ServerIcon>
            <ServerIcon iconUrl="" name="Hello"></ServerIcon>
        </div>
    );
}
