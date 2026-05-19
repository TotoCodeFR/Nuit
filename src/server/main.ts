import chalk from "chalk";
import express from "express";
import helmet from "helmet";
import path from "node:path";

export const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://cdn.discordapp.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                ],
            },
        },
    }),
);

app.use(express.json());

app.listen(process.env.PORT || 3000, async () => {
    await import("./discordauth");
    await import("./dashboard");

    app.use(express.static(path.join(__dirname, "../../dist/web")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../dist/web/index.html"));
    });
});
