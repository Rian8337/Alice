import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        CommandHelper.getLocale(interaction),
    );
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "dancourse",
    description: "Main command for dan and skill courses.",
    options: [
        {
            name: "claim",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Claims a dan or skill course role.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the course.",
                    autocomplete: true,
                },
            ],
        },
        {
            name: "leaderboard",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Views the leaderboard of a dan or skill course.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the course.",
                    autocomplete: true,
                },
            ],
        },
    ],
    example: [],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
