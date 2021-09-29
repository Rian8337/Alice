import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "trivia",
    description: "Main command for trivia-related features.",
    options: [
        {
            name: "questions",
            type: CommandArgumentType.SUB_COMMAND,
            description: "The default quiz command.",
            options: [
                {
                    name: "forcecategory",
                    type: CommandArgumentType.BOOLEAN,
                    description: "Whether to enforce a specific question category (you will be prompted to choose)."
                },
                {
                    name: "type",
                    type: CommandArgumentType.INTEGER,
                    description: "The type of the question. Defaults to random.",
                    choices: [
                        {
                            name: "Multiple Choice",
                            value: 1
                        },
                        {
                            name: "Fill-in-the-blank",
                            value: 2
                        }
                    ]
                }
            ]
        }
    ],
    example: [],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};