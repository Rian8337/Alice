import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.TOURNAMENT;

export const config: SlashCommand["config"] = {
    name: "pool",
    description: "Main command for tournament mappools.",
    options: [
        {
            name: "leaderboard",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Leaderboard commands for tournament mappools.",
            options: [
                {
                    name: "output",
                    description:
                        "Outputs the ScoreV2 leaderboard of a tournament beatmap to a CSV file.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "id",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The ID of the mappool.",
                        },
                        {
                            name: "pick",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The pick to output (NM1, NM2, etc).",
                        },
                    ],
                },
                {
                    name: "view",
                    description:
                        "Views the ScoreV2 leaderboard of a tournament beatmap in a registered tournament mappool.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "id",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The ID of the mappool.",
                        },
                        {
                            name: "pick",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The pick to view (NM1, NM2, etc).",
                        },
                    ],
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Retrieves a list of beatmaps from a registered tournament mappool.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the mappool.",
                },
            ],
        },
    ],
    example: [
        {
            command: "pool view",
            arguments: [
                {
                    name: "id",
                    value: "t11sf",
                },
            ],
            description:
                'will retrieve a list of beatmaps from tournament mappool "t11sf".',
        },
        {
            command: "pool view",
            arguments: [
                {
                    name: "id",
                    value: "t8gf",
                },
            ],
            description:
                'will retrieve a list of beatmaps from tournament mappool "t8gf".',
        },
    ],
    permissions: [],
    scope: "ALL",
};
