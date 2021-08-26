import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "recent",
    description: "Shows the recent play of a player.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows the recent play of a Discord user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to show."
                },
                {
                    name: "index",
                    type: CommandArgumentType.INTEGER,
                    description: "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play."
                }
            ]
        },
        {
            name: "uid",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows the recent play of an osu!droid account from its uid.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The uid of the osu!droid account."
                },
                {
                    name: "index",
                    type: CommandArgumentType.INTEGER,
                    description: "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play."
                }
            ]
        },
        {
            name: "username",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows the recent play of an osu!droid account from its username.",
            options: [
                {
                    name: "username",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The username of the osu!droid account."
                },
                {
                    name: "index",
                    type: CommandArgumentType.INTEGER,
                    description: "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play."
                }
            ]
        },
        {
            name: "self",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows your recent play.",
            options: [
                {
                    name: "index",
                    type: CommandArgumentType.INTEGER,
                    description: "The n-th play to show, ranging from 1 to 50. Defaults to the most recent play."
                }
            ]
        }
    ],
    example: [
        {
            command: "recent self",
            description: "will show your most recent play."
        },
        {
            command: "recent uid 51076 5",
            description: "will show the 5th most recent play of uid 51076."
        },
        {
            command: "recent username NeroYuki 2",
            description: "will show the 2nd most recent play of username NeroYuki."
        },
        {
            command: "recent user @Rian8337#0001",
            description: "will show the most recent play of Rian8337."
        }
    ],
    permissions: [],
    scope: "ALL"
};