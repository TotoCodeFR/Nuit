import { useEffect, useState } from "react";
import { AuthError, api, type CurrentUser } from "../lib/api";

export default function useAuth() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        api.getCurrentUser()
            .then((nextUser) => {
                if (!active) return;
                setUser(nextUser);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (err instanceof AuthError) {
                    setUser(null);
                    setError(null);
                    return;
                }
                setError(err instanceof Error ? err.message : "Unknown auth error");
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return {
        user,
        loading,
        error,
    };
}
