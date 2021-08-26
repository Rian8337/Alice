import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "fancy",
    description: "Allows managing the permissions of lounge channel.",
    options: [
        {
            name: "lock",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Locks a user from the lounge channel.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to lock."
                },
                {
                    name: "duration",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The duration to lock for, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Use -1 to permanent lock."
                },
                {
                    name: "reason",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The reason for unlocking the user."
                }
            ]
        },
        {
            name: "unlock",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Unlocks a user from the lounge channel.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to unlock."
                },
                {
                    name: "reason",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The reason for unlocking the user."
                }
            ]
        }
    ],
    example: [
        {
            command: "fancy lock @Rian8337#0001",
            description: "will compare your score among others."
        },
        {
            command: "compare uid 51076",
            description: "will compare the score of an osu!droid account with uid 51076."
        },
        {
            command: "compare username NeroYuki",
            description: "will compare the score of an osu!droid account with username NeroYuki."
        },
        {
            command: "compare user @Rian8337#0001",
            description: "will compare the score of Rian8337."
        }
    ],
    permissions: ["BOT_OWNER"],
    replyEphemeral: true,
    scope: "ALL"
};