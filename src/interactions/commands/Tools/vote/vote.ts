import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.tools;

export const config: SlashCommand["config"] = {
    name: "vote",
    description: "Main voting command.",
    options: [
        {
            name: "cancel",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Cancels your picked option in the ongoing vote.",
        },
        {
            name: "check",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Checks the ongoing vote in the channel.",
        },
        {
            name: "end",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Ends the ongoing vote in the channel.",
        },
        {
            name: "contribute",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Contributes to the ongoing vote.",
            options: [
                {
                    name: "option",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    description: "The option to vote for.",
                    minValue: 1,
                },
            ],
        },
        {
            name: "start",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Starts a vote in the channel.",
            options: [
                {
                    name: "topic",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The topic of the vote.",
                },
                {
                    name: "choices",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: 'The choices of the vote, separated by "|".',
                },
                {
                    name: "xpreq",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The Tatsu XP requirement for users to vote.",
                    minValue: 0,
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
