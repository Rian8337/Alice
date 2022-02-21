import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    // TODO: make this an override to default perm instead

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
