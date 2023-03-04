import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.pp;

export const config: SlashCommand["config"] = {
    name: "whitelist",
    description:
        "The main command for droid performance points (dpp) whitelisting system.",
    options: [
        {
            name: "check",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Checks if a beatmap is whitelisted.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID or link. Defaults the latest beatmap cache from the channel (if any).",
                },
            ],
        },
        {
            name: "search",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Tools for browsing the list of whitelisted beatmaps.",
            options: [
                {
                    name: "search",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Searches for whitelisted beatmaps.",
                    options: [
                        {
                            name: "query",
                            type: ApplicationCommandOptionType.String,
                            description: "The query to search for.",
                        },
                        {
                            name: "page",
                            type: ApplicationCommandOptionType.Integer,
                            description: "The page to search for.",
                            minValue: 1,
                        },
                    ],
                },
                {
                    name: "filters",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Lists available filters of the whitelist search query.",
                },
            ],
        },
        {
            name: "unwhitelist",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Unwhitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID, beatmap link, or beatmapset link.",
                },
            ],
        },
        {
            name: "whitelist",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Whitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The beatmap ID, beatmap link, or beatmapset link.",
                },
            ],
        },
    ],
    example: [
        {
            command: "whitelist",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description:
                "will whitelist/unwhitelist the beatmap with ID 1884658.",
        },
        {
            command: "whitelist",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/b/1884658",
                },
            ],
            description:
                "will whitelist/unwhitelist the linked beatmap, depending on the action taken by the user.",
        },
        {
            command: "whitelist",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/s/902745",
                },
            ],
            description:
                "will whitelist/unwhitelist the linked beatmapset, depending on the action taken by the user.",
        },
        {
            command: "whitelist",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description:
                "will whitelist/unwhitelist the linked beatmap/beatmapset (the link contains both beatmap ID and beatmapset ID), depending on the action taken by the user.",
        },
    ],
    permissions: ["Special"],
    scope: "GUILD_CHANNEL",
};
