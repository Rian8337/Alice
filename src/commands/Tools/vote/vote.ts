import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "vote",
    description: "Main voting command.",
    options: [
        {
            name: "check",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Checks the ongoing vote in the channel.",
        },
        {
            name: "end",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Ends the ongoing vote in the channel.",
        },
        {
            name: "contribute",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Contributes to the ongoing vote.",
            options: [
                {
                    name: "option",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    required: true,
                    description: "The option to vote for.",
                },
            ],
        },
        {
            name: "start",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Starts a vote in the channel.",
            options: [
                {
                    name: "topic",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The topic of the vote.",
                },
                {
                    name: "choices",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: 'The choices of the vote, separated by "|".',
                },
            ],
        },
    ],
    example: [
        {
            command: "vote start",
            arguments: [
                {
                    name: "topic",
                    value: "What is your favorite color?",
                },
                {
                    name: "choices",
                    value: "Green | Blue | Red",
                },
            ],
            description:
                'will start a vote in the channel with topic "What is your favorite color?" and choices "Green", "Blue", and "Red".',
        },
        {
            command: "vote contribute",
            arguments: [
                {
                    name: "option",
                    value: 2,
                },
            ],
            description:
                "will vote for option 2 in the current ongoing vote in the channel.",
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "GUILD_CHANNEL",
};
