import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "skin",
    description:
        "View a Discord account's osu! or osu!droid skin or set your own.",
    options: [
        {
            name: "set",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Set your skin.",
            options: [
                {
                    name: "url",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The URL to the skin.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View a user's skin.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to view. Defaults to yourself",
                },
            ],
        },
    ],
    example: [
        {
            command: "skin view",
            description: "will view your own skin.",
        },
        {
            command: "skin view",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will view Rian8337's skin.",
        },
        {
            command: "skin set",
            arguments: [
                {
                    name: "url",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will set your skin to the specified URL.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
