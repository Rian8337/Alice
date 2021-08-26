import { GuildMember } from "discord.js";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { BanOperationResult } from "@alice-interfaces/moderation/BanOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { BanManager } from "@alice-utils/managers/BanManager";
import { banStrings } from "./banStrings";

export const run: Command["run"] = async (client, interaction) => {
    const toBan: GuildMember = await interaction.guild!.members.fetch(interaction.options.getUser("user", true));

    if (toBan.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(banStrings.selfBanError)
        });
    }

    if (!toBan.bannable) {
        return interaction.editReply({
            content: MessageCreator.createReject(banStrings.botCannotBanError)
        });
    }

    if (PermissionHelper.comparePosition(<GuildMember> interaction.member, toBan) !== "HIGHER") {
        return interaction.editReply({
            content: MessageCreator.createReject(banStrings.userCannotBanError)
        });
    }

    const reason: string = interaction.options.getString("reason") ?? "Not specified.";

    const result: BanOperationResult = await BanManager.ban(interaction, toBan, reason);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                banStrings.banFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(banStrings.banSuccessful)
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "ban",
    description: "Bans a user from the server.",
    options: [
        {
            name: "user",
            required: true,
            type: CommandArgumentType.USER,
            description: "The user to ban."
        },
        {
            name: "reason",
            type: CommandArgumentType.STRING,
            description: "The reason for banning the user."
        }
    ],
    example: [
        {
            command: "ban @Rian8337#0001 Apple",
            description: "will ban Rian8337 for \"Apple\"."
        },
        {
            command: "ban 132783516176875520 Grapes",
            description: "will ban the user with that Discord ID for \"Grapes\"."
        }
    ],
    permissions: ["BAN_MEMBERS"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL"
};