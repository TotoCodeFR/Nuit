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

app.use(express.static(path.join(import.meta.dirname, "..", "web")));

app.listen(process.env.PORT || 3000, async () => {
    console.log(
        chalk.green(`[Server] Running on port ${process.env.PORT || 3000}`),
    );

    await import("./discordauth");
    await import("./dashboard");
});
