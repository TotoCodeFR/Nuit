import { betterAuth } from "better-auth";
import { pool } from "../db/main";

const baseURL = process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
    database: pool,
    baseURL,
    emailAndPassword: { enabled: false },
    trustedOrigins: baseURL ? [baseURL] : undefined,
    socialProviders: {
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
            redirectURI: baseURL
                ? `${baseURL}/api/auth/callback/discord`
                : undefined,
        },
    },
});
