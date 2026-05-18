import type { ModuleContext } from "@nuit-bot/api";
import { EmbedBuilder, Events, TextChannel } from "discord.js";
import { guild_modules } from "../../db/schema";
import { and, eq } from "drizzle-orm";

type ArrivalConfig = {
    welcomeChannelId?: string;
    leaveChannelId?: string;
    welcomeMessage?: string;
    leaveMessage?: string;
};

async function getChannelId(
    ctx: ModuleContext,
    guildId: string,
    channelType: "welcomeChannelId" | "leaveChannelId",
) {
    const [config] = await ctx.db
        .select({
            enabled: guild_modules.enabled,
            config: guild_modules.config,
        })
        .from(guild_modules)
        .where(
            and(
                eq(guild_modules.guild_id, guildId),
                eq(guild_modules.module_id, "@nuit-bot/module-arrival"),
            ),
        )
        .limit(1);

    if (!config || !config.enabled) return;

    const arrivalConfig = config.config as ArrivalConfig;
    if (!arrivalConfig[channelType]) return;

    return arrivalConfig[channelType];
}

async function getFieldConfigs(ctx: ModuleContext, guildId: string) {
    const [config] = await ctx.db
        .select({
            enabled: guild_modules.enabled,
            config: guild_modules.config,
        })
        .from(guild_modules)
        .where(
            and(
                eq(guild_modules.guild_id, guildId),
                eq(guild_modules.module_id, "@nuit-bot/module-arrival"),
            ),
        )
        .limit(1);

    if (!config || !config.enabled) return;

    const arrivalConfig = config.config as ArrivalConfig;

    return {
        welcomeMessage:
            arrivalConfig.welcomeMessage || "Welcome, {{displayName}}!",
        leaveMessage: arrivalConfig.leaveMessage || "Goodbye, {{displayName}}.",
    };
}

export async function setup(ctx: ModuleContext) {
    await ctx.api.onEvent(
        Events.GuildMemberAdd,
        async (member) => {
            const channelId = await getChannelId(
                ctx,
                member.guild.id,
                "welcomeChannelId",
            );

            if (!channelId) return;

            const fields = await getFieldConfigs(ctx, member.guild.id);

            if (!fields) return;

            const embed = new EmbedBuilder()
                .setTitle("User Joined")
                .setDescription(
                    (fields.welcomeMessage as string).replaceAll(
                        "{{displayName}}",
                        member.displayName,
                    ),
                );

            let channel: TextChannel | null | undefined;

            try {
                channel = (await ctx.client.channels.fetch(channelId)) as
                    | TextChannel
                    | undefined;
            } catch {
                return;
            }

            await channel?.send({ embeds: [embed] });
        },
        { guildScoped: true },
    );

    await ctx.api.onEvent(
        Events.GuildMemberRemove,
        async (member) => {
            const channelId = await getChannelId(
                ctx,
                member.guild.id,
                "leaveChannelId",
            );

            if (!channelId) return;

            const fields = await getFieldConfigs(ctx, member.guild.id);

            if (!fields) return;

            const embed = new EmbedBuilder()
                .setTitle("User Left")
                .setDescription(
                    (fields.leaveMessage as string).replaceAll(
                        "{{displayName}}",
                        member.displayName,
                    ),
                );

            let channel: TextChannel | null | undefined;

            try {
                channel = (await ctx.client.channels.fetch(channelId)) as
                    | TextChannel
                    | undefined;
            } catch {
                return;
            }

            await channel?.send({ embeds: [embed] });
        },
        { guildScoped: true },
    );

    await ctx.api.registerConfig([
        {
            type: "channel",
            key: "welcomeChannelId",
            label: "Welcome Channel ID",
            description: "Channel used for welcoming new users",
            optional: false,
            default: undefined,
        },
        {
            type: "channel",
            key: "leaveChannelId",
            label: "Leave Channel ID",
            description: "Channel used for users leaving",
            optional: false,
            default: undefined,
        },
        {
            type: "string",
            key: "welcomeMessage",
            label: "Welcome Message",
            description:
                "Message sent when a user joins ({{displayName}} => user display name)",
            optional: true,
            default: "Welcome {{displayName}}!",
        },
        {
            type: "string",
            key: "leaveMessage",
            label: "Leave Message",
            description:
                "Message sent when a user leaves ({{displayName}} => user display name)",
            optional: true,
            default: "Goodbye {{displayName}}.",
        },
    ]);
}
