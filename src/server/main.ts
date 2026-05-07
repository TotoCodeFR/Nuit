import chalk from "chalk";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import session from "express-session";

export const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://cdn.discordapp.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            },
        },
    }),
);

app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }, // 7 days
    }),
);

app.use(express.json());

app.use(express.static(path.join(import.meta.dirname, "..", "web")));

app.listen(process.env.PORT || 8080, async () => {
    console.log(
        chalk.green(`[Server] Running on port ${process.env.PORT || 8080}`),
    );

    await import("./discordauth");
    await import("./dashboard");
});
