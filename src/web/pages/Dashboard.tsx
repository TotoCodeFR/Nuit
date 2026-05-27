import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Card from "../components/Card";
import Container from "../components/Container";
import ServerIcon from "../components/ServerIcon";
import useAuth from "../hooks/useAuth";
import { AuthError, api, type MutualGuild } from "../lib/api";
import "./Dashboard.css";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [guilds, setGuilds] = useState<MutualGuild[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        let active = true;
        api.getMutualGuilds()
            .then((nextGuilds) => {
                if (!active) return;
                setGuilds(nextGuilds);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (err instanceof AuthError) {
                    window.location.assign("/login");
                    return;
                }
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load your guilds",
                );
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [user]);

    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <main className="dashboardPage">
            <Container size="lg">
                <section className="dashboardHeader">
                    <h1>Your servers</h1>
                    <p>
                        Select a guild where you can manage settings to open its
                        module overview.
                    </p>
                </section>

                {loading ? <p>Loading guilds...</p> : null}
                {error ? <p className="dashboardError">{error}</p> : null}

                <section className="dashboardGuildGrid">
                    {guilds.map((guild) => (
                        <Link
                            key={guild.id}
                            to={`/dashboard/${guild.id}/overview`}
                            className="dashboardGuildLink"
                        >
                            <Card level={2} className="dashboardGuildCard">
                                <ServerIcon
                                    name={guild.name}
                                    iconUrl={
                                        guild.icon
                                            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
                                            : null
                                    }
                                    size={56}
                                />
                                <h3>{guild.name}</h3>
                            </Card>
                        </Link>
                    ))}
                </section>
            </Container>
        </main>
    );
}
