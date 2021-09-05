import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "recalc",
    description: "The main command for droid performance points (dpp) recalculation system.",
    options: [
        {
            name: "all",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Recalculates all users in the droid performance points (dpp) system.",
            options: [
                {
                    name: "full",
                    type: CommandArgumentType.BOOLEAN,
                    description: "Whether to consider all plays or only top 75 submitted plays."
                }
            ]
        },
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Recalculates all scores of a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to recalculate."
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