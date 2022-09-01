import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TriviaQuestionType } from "@alice-enums/trivia/TriviaQuestionType";

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
            type: ApplicationCommandOptionType.Subcommand,
            description: "Starts a beatmap trivia in the channel.",
        },
        {
            name: "questions",
            type: ApplicationCommandOptionType.Subcommand,
            description: "The default quiz command.",
            options: [
                {
                    name: "forcecategory",
                    type: ApplicationCommandOptionType.Boolean,
                    description:
                        "Whether to enforce a specific question category (you will be prompted to choose).",
                },
                {
                    name: "type",
                    type: ApplicationCommandOptionType.Integer,
                    description:
                        "The type of the question. Defaults to random.",
                    choices: [
                        {
                            name: "Multiple Choice",
                            value: TriviaQuestionType.multipleChoiceFirstType,
                        },
                        {
                            name: "Fill-in-the-blank",
                            value: TriviaQuestionType.fillInTheBlank,
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
