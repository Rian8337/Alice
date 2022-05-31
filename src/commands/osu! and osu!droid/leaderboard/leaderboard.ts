import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "leaderboard",
    description: "General leaderboard command.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View a beatmap's leaderboard.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The beatmap ID or link to view. If unspecified, will take the latest cached beatmap in the channel.",
                },
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page of the leaderboard. Defaults to 1.",
                },
            ],
        },
        {
            name: "dpp",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View the droid pp (dpp) leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page of the leaderboard. Defaults to 1.",
                },
                {
                    name: "clan",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The clan name to view the leaderboard from.",
                },
            ],
        },
        {
            name: "global",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View the global score leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page of the leaderboard. Defaults to 1.",
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View the droid pp (dpp) prototype leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page of the leaderboard. Defaults to 1.",
                },
            ],
        },
        {
            name: "ranked",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View the ranked score leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page of the leaderboard. Defaults to 1.",
                },
            ],
        },
    ],
    example: [
        {
            command: "leaderboard dpp",
            description: "will view the droid pp leaderboard at page 1.",
        },
        {
            command: "leaderboard ranked",
            arguments: [
                {
                    name: "page",
                    value: 3,
                },
            ],
            description: "will view the ranked score leaderboard at page 3.",
        },
        {
            command: "leaderboard dpp",
            arguments: [
                {
                    name: "clan",
                    value: "Sunda Empire",
                },
            ],
            description:
                'will view the ranked score leaderboard at page 1 for the "Sunda Empire" clan.',
        },
    ],
    cooldown: 20,
    permissions: [],
    scope: "ALL",
};
