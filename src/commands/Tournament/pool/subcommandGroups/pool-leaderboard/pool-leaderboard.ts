import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
