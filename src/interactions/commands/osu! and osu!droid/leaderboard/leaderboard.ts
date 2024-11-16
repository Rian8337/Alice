import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "leaderboard",
    description: "General leaderboard command.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionType.Subcommand,
            description: "View a beatmap's leaderboard.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link to view. If unspecified, will take the latest cached beatmap in the channel.",
                },
                {
                    name: "page",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The page of the leaderboard. Defaults to 1.",
                    minValue: 1,
                },
            ],
        },
        {
            name: "global",
            type: ApplicationCommandOptionType.Subcommand,
            description: "View the global score leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The page of the leaderboard. Defaults to 1.",
                    minValue: 1,
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionType.Subcommand,
            description: "View the droid pp (dpp) prototype leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The page of the leaderboard. Defaults to 1.",
                    minValue: 1,
                },
                {
                    name: "rework",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The name of the rework to view the leaderboard from. Defaults to overall.",
                    autocomplete: true,
                },
            ],
        },
    ],
    example: [
        {
            command: "leaderboard global",
            description: "will view the global game leaderboard.",
        },
    ],
    cooldown: 20,
    permissions: [],
    scope: "ALL",
};
