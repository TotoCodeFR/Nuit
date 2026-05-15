import type { ModuleContext } from "@nuit-bot/api";
import { SlashCommandBuilder } from "discord.js";

declare module "@nuit-bot/api" {
    interface MessageRegistry {
        "logger:hello": {};
    }
}

export async function setup(ctx: ModuleContext) {
    await ctx.api.registerCommand({
        data: new SlashCommandBuilder()
            .setName("log")
            .setDescription("Log a message with the message bus."),

        async execute(interaction, ctx) {
            if (!interaction.isChatInputCommand()) {
                return;
            }

            await ctx.bus.emit("logger:hello", {});

            return interaction.reply("hello");
        },
    });

    await ctx.bus.on("logger:hello", (payload) => {
        console.log("hello");
    });
}
