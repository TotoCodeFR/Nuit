import { app } from "./main.ts";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/auth/discord/login", async (req, res) => {
    const result = await auth.api.signInSocial({
        headers: fromNodeHeaders(req.headers),
        body: {
            provider: "discord",
            callbackURL: "/dashboard",
            errorCallbackURL: "/",
        },
    });

    if ("url" in result && result.url) {
        return res.redirect(result.url);
    }

    return res.status(500).send("Failed to start Discord sign-in");
});
