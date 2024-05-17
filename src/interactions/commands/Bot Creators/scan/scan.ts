import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        CommandHelper.getLocale(interaction),
    );
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "scan",
    description: "Performs a scan based on the chosen subcommand.",
    options: [
        {
            name: "dpp",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Scans the entire dpp database for unranked plays.",
        },
        {
            name: "whitelist",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Scans the entire whitelisting and dpp database for unwhitelisted/unavailable beatmaps.",
        },
    ],
    example: [],
    permissions: ["BotOwner"],
    scope: "ALL",
};
