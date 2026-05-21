import Button from "../components/Button";
import ServerIcon from "../components/ServerIcon";
import Card from "../components/Card";
import "../styles/global.css";
import "./Test.css";
import {
    WarningIcon,
    CheckCircleIcon,
    XIcon,
    InfoIcon,
    LockIcon,
} from "@phosphor-icons/react";
import Badge from "../components/Badge";

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
            <h2>Cards</h2>
            <div
                style={{
                    width: "400px",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Card level={1} className="card--row">
                    <ServerIcon
                        name="Hello"
                        iconUrl="https://images.unsplash.com/photo-1779332317860-ddf6f5ee74a2?w=48&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8"
                    ></ServerIcon>

                    <h1>Hello</h1>
                </Card>
            </div>
            <h2>Badges</h2>
            <Badge
                label="Not installed"
                variant="warning"
                icon={<WarningIcon size={12} weight="fill" />}
            />
            <Badge
                label="Bot installed"
                variant="success"
                icon={<CheckCircleIcon size={12} weight="fill" />}
            />
            <Badge
                label="Banned"
                variant="danger"
                icon={<XIcon size={12} weight="bold" />}
            />
            <Badge
                label="Beta"
                variant="info"
                icon={<InfoIcon size={12} weight="fill" />}
            />
            <Badge
                label="Private"
                variant="default"
                icon={<LockIcon size={12} weight="fill" />}
            />
            <Badge label="Unlisted" variant="default" />
        </div>
    );
}
