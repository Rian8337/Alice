import { SlashSubcommandGroup } from "@alice-interfaces/core/SlashSubcommandGroup";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const config: SlashSubcommandGroup["config"] = {
    permissions: ["MANAGE_GUILD"],
};
