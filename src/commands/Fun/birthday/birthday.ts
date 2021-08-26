import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "birthday",
    description: "Allows managing birthday dates.",
    options: [
        {
            name: "forceset",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Forcefully sets a user's birthday.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to set the birthday for."
                },
                {
                    name: "month",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The month of birthday, ranging from 1 to 12."
                },
                {
                    name: "date",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The date of the birthday, ranging from 1 to the max date of the month."
                },
                {
                    name: "timezone",
                    required: true,
                    type: CommandArgumentType.NUMBER,
                    description: "The timezone of the user, ranging from -12 to 14. Decimals are supported (e.g. UTC+5:30 = 5.5)."
                }
            ]
        },
        {
            name: "set",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Sets your birthday.",
            options: [
                {
                    name: "month",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The month of birthday, ranging from 1 to 12."
                },
                {
                    name: "date",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The date of the birthday, ranging from 1 to the max date of the month."
                },
                {
                    name: "timezone",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The timezone of the user, ranging from -12 to 14."
                }
            ]
        },
        {
            name: "view",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views a user's birthday.",
            options: [
                {
                    name: "user",
                    type: CommandArgumentType.USER,
                    description: "The Discord user to view. Defaults to yourself."
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
    permissions: [],
    scope: "GUILD_CHANNEL"
};