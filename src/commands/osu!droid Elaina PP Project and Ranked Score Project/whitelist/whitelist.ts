import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "whitelist",
    description:
        "The main command for droid performance points (dpp) whitelisting system.",
    options: [
        {
            name: "check",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Checks if a beatmap is whitelisted.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The beatmap ID or link. Defaults the latest beatmap cache from the channel (if any).",
                },
            ],
        },
        {
            name: "search",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Tools for browsing the list of whitelisted beatmaps.",
            options: [
                {
                    name: "search",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Searches for whitelisted beatmaps.",
                    options: [
                        {
                            name: "query",
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The query to search for.",
                        },
                        {
                            name: "page",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description: "The page to search for.",
                            minValue: 1,
                        },
                    ],
                },
                {
                    name: "filters",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Lists available filters of the whitelist search query.",
                },
            ],
        },
        {
            name: "unwhitelist",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Unwhitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The beatmap ID, beatmap link, or beatmapset link.",
                },
            ],
        },
        {
            name: "whitelist",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Whitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
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
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL",
};
