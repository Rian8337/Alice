import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.BOT_CREATORS;

export const config: SlashCommand["config"] = {
    name: "scan",
    description: "Performs a scan based on the chosen subcommand.",
    options: [
        {
            name: "dpp",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Scans the entire dpp database for unranked plays.",
        },
        {
            name: "whitelist",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Scans the entire whitelisting and dpp database for unwhitelisted/unavailable beatmaps.",
        },
    ],
    example: [],
    permissions: ["BOT_OWNER"],
    scope: "ALL",
};
