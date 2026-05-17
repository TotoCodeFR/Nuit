import type { ModuleContext, NuitDb } from "@nuit-bot/api";
import { guild_modules } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/main";
import { EmbedBuilder, type TextChannel } from "discord.js";

type LogPayload = {
    message: string;
    guildId: string;
    title?: string;
    level?: "info" | "warning" | "error";
};

type LoggerConfig = {
    channelId?: string;
};

declare module "@nuit-bot/api" {
    interface MessageRegistry {
        "logger:log": LogPayload;
    }
}

async function getLogChannelId(guildId: string) {
    const [config] = await db
        .select({
            enabled: guild_modules.enabled,
            config: guild_modules.config,
        })
        .from(guild_modules)
        .where(
            and(
                eq(guild_modules.guild_id, guildId),
                eq(guild_modules.module_id, "@nuit-bot/module-logger"),
            ),
        )
        .limit(1);

    if (!config || !config.enabled) return;

    const loggerConfig = config.config as LoggerConfig;
    if (!loggerConfig.channelId) return;

    return loggerConfig.channelId;
}

export async function setup(ctx: ModuleContext) {
    await ctx.bus.on("logger:log", async (payload: LogPayload) => {
        const channelId = await getLogChannelId(payload.guildId);

        if (!channelId) return;

        let logChannel: TextChannel | undefined;

        try {
            logChannel = (await ctx.client.channels.fetch(channelId)) as
                | TextChannel
                | undefined;
        } catch (err) {
            return;
        }

        if (!logChannel) return;

        const levelColors: Record<string, number> = {
            info: 0x3498db,
            warning: 0xf1c40f,
            error: 0xe74c3c,
        };

        const logEmbed = new EmbedBuilder()
            .setTitle(payload.title ?? "Log")
            .setDescription(payload.message)
            .setColor(levelColors[payload.level ?? "info"] ?? 0x3498db);

        await logChannel.send({ embeds: [logEmbed] });
    });

    ctx.api.registerConfig([
        {
            key: "channelId",
            label: "Log Channel ID",
            type: "channel",
            description: "Channel used for logging",
            optional: true,
            default: undefined,
        },
    ]);
}
