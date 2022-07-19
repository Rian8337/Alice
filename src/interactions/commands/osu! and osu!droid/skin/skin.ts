import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "skin",
    description:
        "View a Discord account's osu! or osu!droid skin or set your own.",
    options: [
        {
            name: "set",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Set your skin.",
            options: [
                {
                    name: "url",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The URL to the skin.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
            description: "View a user's skin.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
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
