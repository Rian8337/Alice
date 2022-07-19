import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "mapshare",
    description: "Main command for map sharing.",
    options: [
        {
            name: "accept",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Accepts a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link that the submission is sharing.",
                },
            ],
        },
        {
            name: "ban",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Bans a user from submitting a map share submission.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to ban.",
                },
            ],
        },
        {
            name: "deny",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Denies a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link that the submission is sharing.",
                },
            ],
        },
        {
            name: "list",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Lists all map sharing submissions with the specified status.",
            options: [
                {
                    name: "status",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The status of submissions to list. Defaults to pending.",
                    choices: [
                        {
                            name: "Accepted",
                            value: "accepted",
                        },
                        {
                            name: "Denied",
                            value: "denied",
                        },
                        {
                            name: "Pending",
                            value: "pending",
                        },
                        {
                            name: "Posted",
                            value: "posted",
                        },
                    ],
                },
                {
                    name: "page",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The page to view. Defaults to 1.",
                },
            ],
        },
        {
            name: "post",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Posts a map sharing submission to the map share channel.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link that the submission is sharing.",
                },
            ],
        },
        {
            name: "submit",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Submits a new map sharing submission.",
        },
        {
            name: "unban",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Unbans a user from submitting a map share submission.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to unban.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Views a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link that the submission is sharing.",
                },
            ],
        },
    ],
    example: [
        {
            command: "mapshare submit",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
                {
                    name: "summary",
                    value: "This map is so good",
                },
            ],
            description:
                'will submit a new map sharing submission with the linked beatmap and summary "This map is so good".',
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
