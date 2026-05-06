import type { NextFunction, Request, Response } from "express";
import { app } from "./main";
import type { User } from "@supabase/supabase-js";
import type { Json } from "@nuit-bot/api";
import path from "node:path";
import { PermissionsBitField } from "discord.js";
import { client } from "../discord/main";
import {
    globalRegistry,
    guildModulesCache,
} from "../discord/utility/moduleLoader";
import { TtlCache } from "../utility/cache";
import { getSupabaseClient } from "../utility/supabase";

export interface DiscordRESTGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

export const mutualGuildsCache = new TtlCache<string, []>(90_000);
export const guildCache = new TtlCache<string, object>(90_000);

const supabase = getSupabaseClient();

function getModuleSchema(moduleId: string) {
    return globalRegistry.config.filter((field) => field.module === moduleId);
}

function getAllModuleIds() {
    return Array.from(
        new Set([
            ...globalRegistry.commands.map((command) => command.module),
            ...globalRegistry.events.map((event) => event.module),
            ...globalRegistry.config.map((field) => field.module),
        ]),
    );
}

function formatModuleName(moduleId: string) {
    return (
        moduleId
            .split("/")
            .at(-1)
            ?.replace(/^module-/, "")
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ") ?? moduleId
    );
}

function getModuleKind(moduleId: string) {
    return (
        globalRegistry.commands.find((command) => command.module === moduleId)
            ?.kind ?? null
    );
}

function moduleExists(moduleId: string) {
    return (
        globalRegistry.config.some((field) => field.module === moduleId) ||
        globalRegistry.commands.some(
            (command) => command.module === moduleId,
        ) ||
        globalRegistry.events.some((event) => event.module === moduleId)
    );
}

function isJsonObject(value: Json | undefined): value is Record<string, Json> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function getGuildModulesOverview(guildId: string) {
    let storedModules = guildModulesCache.get(guildId);

    if (!storedModules) {
        const { data, error } = await supabase
            .from("guild_modules")
            .select("*")
            .eq("guild_id", guildId);

        if (error) {
            throw error;
        }

        storedModules = data ?? [];
        guildModulesCache.set(guildId, storedModules);
    }

    return getAllModuleIds()
        .filter((moduleId) => getModuleKind(moduleId) !== "internal")
        .map((moduleId) => {
            const stored = storedModules.find(
                (entry) => entry.module_id === moduleId,
            );
            const fields = getModuleSchema(moduleId);

            return {
                id: moduleId,
                name: formatModuleName(moduleId),
                kind: getModuleKind(moduleId),
                enabled: stored?.enabled ?? false,
                configurable: fields.length > 0,
                commandCount: globalRegistry.commands.filter(
                    (command) => command.module === moduleId,
                ).length,
                eventCount: globalRegistry.events.filter(
                    (event) => event.module === moduleId,
                ).length,
                fieldCount: fields.length,
                updatedAt: stored?.updated_at ?? null,
            };
        });
}

export async function getMutualGuilds(providerToken: string, userId: string) {
    let guilds;

    if (!mutualGuildsCache.get(userId)) {
        const response = await fetch(
            "https://discord.com/api/v10/users/@me/guilds",
            {
                headers: { Authorization: `Bearer ${providerToken}` },
            },
        );

        guilds = await response.json();
        mutualGuildsCache.set(userId, guilds);
    } else {
        guilds = mutualGuildsCache.get(userId);
    }

    const botGuildIds = new Set(client.guilds.cache.keys());

    return guilds.filter((g: DiscordRESTGuild) => {
        const perms = BigInt(g.permissions);
        const hasManageGuild =
            (perms & PermissionsBitField.Flags.ManageGuild) !== 0n;
        return hasManageGuild && botGuildIds.has(g.id);
    });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.supabaseSession)
        return res.redirect("/auth/discord/login");
    next();
}

export function userToDiscord(user: User) {
    if (!user) throw new Error("User does not exist");

    return {
        displayName: user.user_metadata.custom_claims.global_name,
        username: user.user_metadata.full_name,
        avatarUrl: user.user_metadata.avatar_url,
        id: user.user_metadata.provider_id,
    };
}

export async function hasAccess(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const guildId = req.params.guildId;
    if (typeof guildId !== "string") throw new Error("Missing guild ID");

    const mutual = await getMutualGuilds(
        req.session.supabaseSession?.provider_token as string,
        userToDiscord(req.session.supabaseSession?.user as User).id,
    );

    if (mutual.some((g: DiscordRESTGuild) => g.id === guildId)) {
        next();
    } else {
        return res.redirect("/dashboard");
    }
}

app.get("/dashboard/:guildId/overview", requireAuth, hasAccess, (req, res) => {
    res.sendFile(
        path.join(import.meta.dirname, "..", "web", "overview", "index.html"),
    );
});

app.get("/dashboard/:guildId/:module", requireAuth, hasAccess, (req, res) => {
    res.sendFile(
        path.join(import.meta.dirname, "..", "web", "config", "index.html"),
    );
});

app.get(
    "/api/guild/:guildId/:module/config",
    requireAuth,
    hasAccess,
    async (req, res) => {
        const { guildId, module: moduleId } = req.params;

        if (typeof guildId !== "string" || typeof moduleId !== "string") {
            return res.status(400).json({ error: "Missing route params" });
        }

        if (!moduleExists(moduleId)) {
            return res.status(404).json({ error: "Unknown module" });
        }

        const schema = getModuleSchema(moduleId);

        const { data, error } = await supabase
            .from("guild_modules")
            .select("config, enabled, updated_at")
            .eq("guild_id", guildId)
            .eq("module_id", moduleId)
            .maybeSingle();

        if (error) {
            console.error("Failed to fetch module config", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch module config" });
        }

        res.json({
            guildId,
            module: moduleId,
            schema,
            enabled: data?.enabled ?? false,
            config: isJsonObject(data?.config) ? data.config : {},
            updatedAt: data?.updated_at ?? null,
        });
    },
);

app.put(
    "/api/guild/:guildId/:module/config",
    requireAuth,
    hasAccess,
    async (
        req: Request<
            { guildId: string; module: string },
            any,
            { config?: Json }
        >,
        res,
    ) => {
        const { guildId, module: moduleId } = req.params;
        const nextConfig = req.body?.config;

        if (typeof guildId !== "string" || typeof moduleId !== "string") {
            return res.status(400).json({ error: "Missing route params" });
        }

        if (!moduleExists(moduleId)) {
            return res.status(404).json({ error: "Unknown module" });
        }

        if (!isJsonObject(nextConfig)) {
            return res.status(400).json({
                error: "Expected body shape { config: { ... } }",
            });
        }

        const { data: existing, error: existingError } = await supabase
            .from("guild_modules")
            .select("enabled")
            .eq("guild_id", guildId)
            .eq("module_id", moduleId)
            .maybeSingle();

        if (existingError) {
            console.error("Failed to read current module state", existingError);
            return res
                .status(500)
                .json({ error: "Failed to update module config" });
        }

        const { data, error } = await supabase
            .from("guild_modules")
            .upsert(
                {
                    guild_id: guildId,
                    module_id: moduleId,
                    config: nextConfig,
                    enabled: existing?.enabled ?? false,
                },
                { onConflict: "guild_id,module_id" },
            )
            .select("config, enabled, updated_at")
            .single();

        if (error) {
            console.error("Failed to update module config", error);
            return res
                .status(500)
                .json({ error: "Failed to update module config" });
        }

        guildModulesCache.delete(guildId);

        res.json({
            guildId,
            module: moduleId,
            schema: getModuleSchema(moduleId),
            enabled: data.enabled,
            config: isJsonObject(data.config) ? data.config : {},
            updatedAt: data.updated_at,
        });
    },
);

app.get(
    "/api/guild/:guildId/modules",
    requireAuth,
    hasAccess,
    async (req, res) => {
        const { guildId } = req.params;

        if (typeof guildId !== "string") {
            return res.status(400).json({ error: "Missing route params" });
        }

        try {
            const modules = await getGuildModulesOverview(guildId);
            return res.json(modules);
        } catch (error) {
            console.error("Failed to fetch guild modules overview", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch guild modules" });
        }
    },
);

app.get("/api/users/@me", (req, res) => {
    if (!req.session.supabaseSession?.user) {
        return res.status(401).send("Unauthorized");
    }
    res.json(userToDiscord(req.session.supabaseSession?.user!));
});

app.get("/api/guilds/common", async (req, res) => {
    if (!req.session.supabaseSession?.user) {
        return res.status(401).send("Unauthorized");
    }

    const providerToken = req.session.supabaseSession?.provider_token;
    if (!providerToken) return res.status(401).send("No provider token");

    let mutualGuilds;

    const user = userToDiscord(req.session.supabaseSession.user);

    try {
        mutualGuilds = await getMutualGuilds(providerToken, user.id);
    } catch (err) {
        res.status(500).send("Internal Server Error");
        return console.error(
            "Something went wrong when fetching mutual guilds",
            err,
        );
    }

    res.json(mutualGuilds);
});

app.get("/api/guild/:guildId", requireAuth, hasAccess, async (req, res) => {
    const { guildId } = req.params;

    const cached = guildCache.get(guildId as string);
    if (cached) return res.json(cached);

    const guild: any = (await client.guilds.fetch(guildId as string)).toJSON();

    const guildConfig = await supabase
        .from("guilds")
        .select("config")
        .eq("guild_id", String(guildId))
        .single();

    const formattedGuild = {
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL,
        members: guild.members,
        channels: guild.channels,
        bans: guild.bans,
        roles: guild.roles,
        invites: guild.invites,
        autoModerationRules: guild.autoModerationRules,
        shardId: guild.shardId,
        splash: guild.splash,
        banner: guild.banner,
        description: guild.description,
        vanityURLCode: guild.vanityURLCode,
        memberCount: guild.memberCount,
        large: guild.large,
        botJoinedTimestamp: guild.joinedTimestamp,
        rulesChannelId: guild.rulesChannelId,
        updateChannelId: guild.publicUpdatesChannelId,
        locale: guild.preferredLocale,
        ownerId: guild.ownerId,
        emojis: guild.emojis,
        stickers: guild.stickers,
        createdTimestamp: guild.createdTimestamp,
        nameAcronym: guild.nameAcronym,
        guildConfig,
    };

    guildCache.set(guildId as string, formattedGuild as object);

    res.json(formattedGuild);
});
