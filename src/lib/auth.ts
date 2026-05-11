import { betterAuth } from "better-auth";
import { pool } from "../db/main";

export const auth = betterAuth({
    database: pool,
    emailAndPassword: { enabled: false },
    socialProviders: {
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        },
    },
});
