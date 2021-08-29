import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "mute",
    description: "Mutes a user. This command's permission can be configured using the /settings command.",
    options: [
        {
            name: "temporary",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Temporarily mutes a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to mute."
                },
                {
                    name: "duration",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The duration to mute for, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Minimum is 30 seconds."
                },
                {
                    name: "reason",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The reason for muting the user. Maximum length is 1500 characters."
                }
            ]
        },
        {
            name: "permanent",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Permanently mutes a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to mute."
                },
                {
                    name: "reason",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The reason for muting the user. Maximum length is 1500 characters."
                }
            ]
        }
    ],
    example: [
        {
            command: "mute permanent @Rian8337#0001 boo",
            description: "will mute Rian8337 permanently with reason \"boo\"."
        },
        {
            command: "mute temporary 132783516176875520 2h bad",
            description: "will mute the user with that Discord ID for 2 hours with reason \"bad\"."
        }
    ],
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL"
};