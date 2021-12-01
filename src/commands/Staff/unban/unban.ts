import { GuildBan, Snowflake, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BanManager } from "@alice-utils/managers/BanManager";
import { unbanStrings } from "./unbanStrings";

export const run: Command["run"] = async (_, interaction) => {
    const banInfo: GuildBan = await interaction.guild!.bans.fetch(
        <Snowflake>interaction.options.getString("user", true)
    );

    if (!banInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unbanStrings.userToUnbanNotFound
            ),
        });
    }

    const toUnban: User = banInfo.user;

    if (toUnban.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(unbanStrings.selfUnbanError),
        });
    }

    const reason: string =
        interaction.options.getString("reason") ?? "Not specified.";

    const result: OperationResult = await BanManager.unban(
        interaction,
        toUnban,
        reason
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unbanStrings.unbanFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(unbanStrings.unbanSuccessful),
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "unban",
    description: "Unbans a user from the server.",
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The ID of the user to unban.",
        },
        {
            name: "reason",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The reason for unbanning the user.",
        },
    ],
    example: [
        {
            command: "unban",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "reason",
                    value: "Apple",
                },
            ],
            description: 'will unban Rian8337 for "Apple".',
        },
        {
            command: "unban",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
                {
                    name: "reason",
                    value: "Grapes",
                },
            ],
            description:
                'will unban the user with that Discord ID for "Grapes".',
        },
    ],
    replyEphemeral: true,
    permissions: ["BAN_MEMBERS"],
    scope: "GUILD_CHANNEL",
};
