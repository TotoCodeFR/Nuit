import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    GuildBan,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
    SlashCommandBuilder,
    type Interaction,
    type UserResolvable,
} from "discord.js";
import { cleanMultiline } from "../../discord/utility/cleanMultiline";

export default {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unbans a previously banned user")
        .setDescriptionLocalization(
            "fr",
            "Débanne un utilisateur précédemment banni",
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addStringOption((option) =>
            option
                .setName("target")
                .setDescription(
                    "The user to unban (format: username / @username / user ID)",
                )
                .setNameLocalization("fr", "cible")
                .setDescriptionLocalization(
                    "fr",
                    "L'utilisateur à débannir (format: nomdutilisateur / @nomdutilisateur / ID utilisateur)",
                )
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("The reason to unban the user")
                .setNameLocalization("fr", "raison")
                .setDescriptionLocalization(
                    "fr",
                    "La raison de débannir l'utilisateur",
                ),
        ),
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        // We check permissions incase `.setDefaultMemberPermissions` has a weird use case or the command is ran unconventionnally
        const permissions = interaction.member!
            .permissions as PermissionsBitField;
        if (!permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's weird!
                You shouldn't be able to run that command unless you have some sort of trick up your sleeve.
                -# But I guess it's okay, since you can't unban anyone anyway.`),
            });
        }

        const botMember = await interaction.guild!.members!.fetch(
            interaction.client.user.id,
        );
        if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.editReply({
                content: cleanMultiline(`# Well that's awkward!
                I'm lacking the permission to ban users from this server (which also allows unbans).
                -# Maybe an admin could grant it to me? I promise I won't nuke anything*!
                -# Unless the bot gets hacked I guess...`),
            });
        }

        const rawTarget = interaction.options.getString("target", true).trim();
        const mentionMatch = rawTarget.match(/^<@!?(\d+)>$/);
        const idCandidate = mentionMatch?.[1] || rawTarget;
        const isUserId = /^\d{17,20}$/.test(idCandidate);

        let target: UserResolvable | null = null;

        if (isUserId) {
            try {
                const user = await interaction.client.users.fetch(idCandidate);
                target = user.id;
            } catch {
                target = null;
            }
        }

        if (!target) {
            try {
                const bans = await interaction.guild!.bans.fetch();
                const loweredTarget = rawTarget.toLowerCase();

                const matchedBan = bans.find((ban) => {
                    const username = ban.user.username.toLowerCase();
                    const globalName = ban.user.globalName?.toLowerCase();
                    const tag =
                        `${ban.user.username}#${ban.user.discriminator}`.toLowerCase();

                    return (
                        username === loweredTarget ||
                        globalName === loweredTarget ||
                        tag === loweredTarget
                    );
                });

                if (matchedBan) {
                    target = matchedBan.user.id;
                }
            } catch {
                target = null;
            }
        }

        if (!target) {
            return await interaction.editReply({
                content: cleanMultiline(`# Invalid target!
                I couldn't resolve that target to a valid user.
                -# Use a user ID or username.`),
            });
        }

        let targetBan: GuildBan;
        try {
            targetBan = await interaction.guild!.bans.fetch(target);
        } catch (error) {
            return await interaction.editReply({
                content: cleanMultiline(`# User not found!
                The user you're trying to unban isn't banned.
                -# Make sure the user is still banned and try again.`),
            });
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(
                `Are you sure you want to unban \`${targetBan.user.displayName}\` from this server?`,
            )
            .addFields({
                name: "Reason",
                value: `${interaction.options.getString("reason") || "No reason specified"}`,
            })
            .setFooter({ text: "You have 2 minutes to answer" })
            .setTimestamp();

        const confirmButton = new ButtonBuilder()
            .setCustomId(
                `unban/confirm/${targetBan.user.id}/${Date.now().toString()}`,
            )
            .setLabel("Confirm")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Primary);

        const cancelButton = new ButtonBuilder()
            .setCustomId(
                `unban/cancel/${targetBan.user.id}/${Date.now().toString()}`,
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
            i.customId.startsWith("unban/") &&
            i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 120_000,
                componentType: ComponentType.Button,
            });

            if (confirmation.customId.startsWith("unban/confirm")) {
                await confirmation.update({
                    content: `# Processing unban...\nGiving ${targetBan.user.displayName} a redemption arc.\n-# This might take a moment while I work my magic.`,
                    components: [],
                    embeds: [],
                });

                try {
                    await interaction.guild?.members.unban(
                        targetBan.user.id,
                        interaction.options.getString("reason") || undefined,
                    );
                    await interaction.editReply({
                        content: `# He's back!\n${targetBan.user.displayName} has been successfully unbanned from the server.\n-# They will have to rejoin using an invite though.`,
                    });
                } catch (error) {
                    await interaction.editReply({
                        content: `# Oops!\nSomething went wrong while trying to unban this user.\n-# Maybe they're already unbanned? Or just a server-side problem...`,
                    });
                }
            } else if (confirmation.customId.startsWith("ban/cancel")) {
                await confirmation.update({
                    content: "Ban operation cancelled.",
                    components: [],
                    embeds: [],
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: `# Time's up!\nNo response received, so I'm not unbanning anyone.\n-# Maybe you changed your mind? That's cool too!`,
                components: [],
                embeds: [],
            });
        }
    },
};
