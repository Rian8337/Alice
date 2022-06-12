import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const config: SlashSubcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
