import { app } from "./main.ts";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

app.get("/api/auth/discord/login", async (req, res) => {
    const result = await auth.api.signInSocial({
        headers: fromNodeHeaders(req.headers),
        returnHeaders: true,
        body: {
            provider: "discord",
            callbackURL: "/dashboard",
            errorCallbackURL: "/",
        },
    });

    if ("headers" in result && result.headers) {
        const headers = result.headers as Headers & {
            getSetCookie?: () => string[];
        };
        const setCookies = headers.getSetCookie?.() ?? [];

        for (const cookie of setCookies) {
            res.append("set-cookie", cookie);
        }

        if (!setCookies.length) {
            const setCookie = headers.get("set-cookie");

            if (setCookie) {
                res.append("set-cookie", setCookie);
            }
        }

        const location = headers.get("location");

        if (typeof location === "string" && location.length > 0) {
            return res.redirect(location);
        }
    }

    if ("url" in result && typeof result.url === "string") {
        return res.redirect(result.url);
    }

    return res.status(500).send("Failed to start Discord sign-in");
});

app.all("/api/auth/{*any}", toNodeHandler(auth));
