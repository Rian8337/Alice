import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
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
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Forcefully sets a user's birthday.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user to set the birthday for.",
                },
                {
                    name: "month",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The month of birthday, ranging from 1 to 12.",
                },
                {
                    name: "date",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The date of the birthday, ranging from 1 to the max date of the month.",
                },
                {
                    name: "timezone",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The timezone of the user, ranging from -12 to 14. Decimals are supported (e.g. UTC+5:30 = 5.5).",
                },
            ],
        },
        {
            name: "set",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Sets your birthday.",
            options: [
                {
                    name: "month",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The month of birthday, ranging from 1 to 12.",
                },
                {
                    name: "date",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The date of the birthday, ranging from 1 to the max date of the month.",
                },
                {
                    name: "timezone",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The timezone of the user, ranging from -12 to 14.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views a user's birthday.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description:
                        "The Discord user to view. Defaults to yourself.",
                },
            ],
        },
    ],
    example: [
        {
            command: "birthday set",
            arguments: [
                {
                    name: "month",
                    value: 2,
                },
                {
                    name: "date",
                    value: 8,
                },
                {
                    name: "timezone",
                    value: 7,
                },
            ],
            description: "will set your birthday to February 8 at UTC+7.",
        },
        {
            command: "birthday view",
            description: "will view your birthday.",
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
