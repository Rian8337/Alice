import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SlashSubcommandGroup } from "structures/core/SlashSubcommandGroup";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
