import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
    SlashCommandBuilder,
    type Interaction,
} from "discord.js";
import { cleanMultiline } from "../../discord/utility/cleanMultiline";
import type { BaseCtx } from "@nuit-bot/api";

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks a selected user")
        .setDescriptionLocalization("fr", "Expulse un utilisateur sélectionné")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The user to kick")
                .setNameLocalization("fr", "cible")
                .setDescriptionLocalization("fr", "L'utilisateur à expulser")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("The reason to kick the user")
                .setNameLocalization("fr", "raison")
                .setDescriptionLocalization(
                    "fr",
                    "La raison de l'expulsion de l'utilisateur",
                ),
        ),
    async execute(interaction: Interaction, ctx: BaseCtx) {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        // We check permissions incase `.setDefaultMemberPermissions` has a weird use case or the command is ran unconventionnally
        const permissions = interaction.member!
            .permissions as PermissionsBitField;
        if (!permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's weird!
                You shouldn't be able to run that command unless you have some sort of trick up your sleeve.
                -# But I guess it's okay, since you can't kick anyone anyway.`),
            });
        }

        const botMember = await interaction.guild!.members!.fetch(
            interaction.client.user.id,
        );
        if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's awkward!
                I'm lacking the permission to kick users from this server.
                -# Maybe an admin could grant it to me? I promise I won't nuke anything*!
                -# Unless the bot gets hacked I guess...`),
            });
        }

        let targetMember: GuildMember;
        try {
            targetMember = await interaction.guild!.members.fetch(
                interaction.options.getUser("target")!.id,
            );
        } catch (error) {
            return await interaction.editReply({
                content: cleanMultiline(`# User not found!
                The user you're trying to kick doesn't seem to exist or isn't in this server.
                -# Make sure the user is still in the server and try again.`),
            });
        }

        const botHighest = botMember.roles.highest;
        const targetHighest = targetMember.roles.highest;
        if (botHighest.position <= targetHighest.position) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's unfortunate!
                I can't kick that user since my role is lower or equal to theirs.
                -# Maybe an admin with higher permissions could give me that access?`),
            });
        }

        const admin = interaction.member as GuildMember;
        const adminHighest = admin?.roles.highest;
        if (adminHighest.position <= targetHighest.position) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's not gonna work!
                You can't kick someone with a role higher than or equal to yours.
                -# Role hierarchy matters, even for admins! Maybe ask someone with higher permissions?`),
            });
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(
                `Are you sure you want to kick \`${targetMember.displayName}\` from this server?`,
            )
            .addFields(
                {
                    name: `\`${targetMember.displayName}\``,
                    value: `**Time on the server**: <t:${Math.floor(targetMember.joinedTimestamp! / 1000)}:R>`,
                },
                {
                    name: "Reason",
                    value: `${interaction.options.getString("reason") || "No reason specified"}`,
                },
            )
            .setFooter({ text: "You have 2 minutes to answer" })
            .setTimestamp();

        const confirmButton = new ButtonBuilder()
            .setCustomId(
                `kick/confirm/${targetMember.id}/${Date.now().toString()}`,
            )
            .setLabel("Confirm")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Primary);

        const cancelButton = new ButtonBuilder()
            .setCustomId(
                `kick/cancel/${targetMember.id}/${Date.now().toString()}`,
            )
            .setLabel("Cancel")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
            confirmButton,
            cancelButton,
        );

        await interaction.editReply({
            embeds: [confirmEmbed],
            components: [actionRow],
        });

        const response = await interaction.fetchReply();

        const collectorFilter = (i: ButtonInteraction) =>
            i.customId.startsWith("kick/") && i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 120_000,
                componentType: ComponentType.Button,
            });

            if (confirmation.customId.startsWith("kick/confirm")) {
                await confirmation.update({
                    content: `# Processing kick...\nMaking sure ${targetMember.displayName} they're not here (for now).\n-# This might take a moment while I work my magic.`,
                    components: [],
                    embeds: [],
                });

                try {
                    await targetMember.kick(
                        interaction.options.getString("reason") || undefined,
                    );

                    await ctx.bus.emit("logger:log", {
                        guildId: interaction.guild!.id,
                        title: "Kick",
                        message: `User ${targetMember.displayName} was kicked by ${interaction.user.displayName} for ${interaction.options.getString("reason") ? `the reason \`${interaction.options.getString("reason")}\`` : "no reason"}`,
                        level: "info",
                    });

                    await interaction.editReply({
                        content: `# Got 'em!\n${targetMember.displayName} has been successfully kicked from the server.\n-# They won't be causing trouble anymore!`,
                    });
                } catch (error) {
                    await interaction.editReply({
                        content: `# Oops!\nSomething went wrong while trying to kick this user.\n-# Maybe they left already? Or I don't have enough permissions?`,
                    });
                }
            } else if (confirmation.customId.startsWith("kick/cancel")) {
                await confirmation.update({
                    content: "Kick operation cancelled.",
                    components: [],
                    embeds: [],
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: `# Time's up!\nNo response received, so I'm not kicking anyone.\n-# Maybe you changed your mind? That's cool too!`,
                components: [],
                embeds: [],
            });
        }
    },
};
