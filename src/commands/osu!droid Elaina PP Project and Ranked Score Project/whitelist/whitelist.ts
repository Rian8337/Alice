import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "whitelist",
    description: "The main command for droid performance points (dpp) whitelisting system.\n\nThis command uses a special permission that cannot be modified.",
    options: [
        {
            name: "check",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks if a beatmap is whitelisted.",
            options: [
                {
                    name: "beatmap",
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link. Defaults the latest beatmap cache from the channel (if any)."
                }
            ]
        },
        {
            name: "unwhitelist",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Unwhitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID, beatmap link, or beatmapset link."
                }
            ]
        },
        {
            name: "whitelist",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Whitelist a beatmap or beatmapset.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID, beatmap link, or beatmapset link."
                }
            ]
        }
    ],
    example: [
        {
            command: "whitelist 1764213",
            description: "will whitelist/unwhitelist the beatmap with ID 1764213."
        },
        {
            command: "whitelist https://osu.ppy.sh/b/1884658",
            description: "will whitelist/unwhitelist the linked beatmap, depending on the action taken by the user."
        },
        {
            command: "whitelist https://osu.ppy.sh/s/902745",
            description: "will whitelist/unwhitelist the linked beatmapset, depending on the action taken by the user."
        },
        {
            command: "whitelist https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
            description: "will whitelist/unwhitelist the linked beatmap/beatmapset (the link contains both beatmap ID and beatmapset ID), depending on the action taken by the user."
        }
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL"
};