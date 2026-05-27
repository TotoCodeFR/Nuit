import express from "express";
import helmet from "helmet";
import path from "node:path";
import { getProjectRoot } from "../utility/projectRoot";

export const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://cdn.discordapp.com"],
                "font-src": ["'self'"],
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                ],
            },
        },
    }),
);

app.use(express.json());

async function bootstrap() {
    await import("./discordauth");
    await import("./dashboard");

    const root = getProjectRoot();
    app.use(express.static(path.join(root, "dist", "web")));
    app.get("/{*splat}", (req, res) => {
        res.sendFile(path.join(root, "dist", "web", "index.html"));
    });

    app.listen(process.env.PORT || 3000);
}

void bootstrap();
