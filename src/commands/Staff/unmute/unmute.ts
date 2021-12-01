import { GuildMember } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { unmuteStrings } from "./unmuteStrings";

export const run: Command["run"] = async (_, interaction) => {
    const toUnmute: GuildMember = await interaction.guild!.members.fetch(
        interaction.options.getUser("user", true)
    );

    if (
        !(await MuteManager.userCanMute(
            <GuildMember>interaction.member,
            Number.POSITIVE_INFINITY
        ))
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unmuteStrings.userCannotUnmuteError
            ),
        });
    }

    const reason: string =
        interaction.options.getString("reason") ?? "Not specified.";

    const result: OperationResult = await MuteManager.removeMute(
        toUnmute,
        interaction,
        reason
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                unmuteStrings.unmuteFailed,
                <string>result.reason
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(unmuteStrings.unmuteSuccessful),
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "unmute",
    description: `Unmutes a user. This command's permission can be configured using the /settings command.`,
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to unmute.",
        },
        {
            name: "reason",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The reason for unmuting the user. Maximum length is 1500 characters.",
        },
    ],
    example: [
        {
            command: "unmute",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "reason",
                    value: "boo",
                },
            ],
            description: 'will unmute Rian8337 for "boo".',
        },
        {
            command: "unmute",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
                {
                    name: "reason",
                    value: "bad",
                },
            ],
            description: 'will unmute the user with that Discord ID for "bad".',
        },
    ],
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
