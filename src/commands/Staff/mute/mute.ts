import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "mute",
    description:
        "Mutes a user. This command's permission can be configured using the /settings command.",
    options: [
        {
            name: "temporary",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Temporarily mutes a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to mute.",
                },
                {
                    name: "duration",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The duration to mute for, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Minimum is 30 seconds.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The reason for muting the user. Maximum length is 1500 characters.",
                },
            ],
        },
        {
            name: "permanent",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Permanently mutes a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to mute.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The reason for muting the user. Maximum length is 1500 characters.",
                },
            ],
        },
    ],
    example: [
        {
            command: "mute permanent",
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
            description: 'will mute Rian8337 permanently with reason "boo".',
        },
        {
            command: "mute temporary",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
                {
                    name: "duration",
                    value: "2h",
                },
                {
                    name: "reason",
                    value: "bad",
                },
            ],
            description:
                'will mute the user with that Discord ID for 2 hours with reason "bad".',
        },
    ],
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
