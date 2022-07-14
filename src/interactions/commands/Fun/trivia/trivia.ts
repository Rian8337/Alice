import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.FUN;

export const config: SlashCommand["config"] = {
    name: "trivia",
    description: "Main command for trivia-related features.",
    options: [
        {
            name: "map",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Starts a beatmap trivia in the channel.",
        },
        {
            name: "questions",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "The default quiz command.",
            options: [
                {
                    name: "forcecategory",
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    description:
                        "Whether to enforce a specific question category (you will be prompted to choose).",
                },
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The type of the question. Defaults to random.",
                    choices: [
                        {
                            name: "Multiple Choice",
                            value: 1,
                        },
                        {
                            name: "Fill-in-the-blank",
                            value: 2,
                        },
                    ],
                },
            ],
        },
    ],
    example: [],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};
