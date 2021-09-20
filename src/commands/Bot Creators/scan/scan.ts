import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "scan",
    description: "Performs a scan based on the chosen subcommand.",
    options: [
        {
            name: "dpp",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Scans the entire dpp database for unranked plays."
        },
        {
            name: "whitelist",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Scans the entire whitelisting and dpp database for unwhitelisted/unavailable beatmaps."
        }
    ],
    example: [],
    permissions: ["BOT_OWNER"],
    scope: "ALL"
};