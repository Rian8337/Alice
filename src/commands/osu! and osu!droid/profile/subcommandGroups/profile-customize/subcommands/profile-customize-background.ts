import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: "Change Background",
                value: "changeBackground",
                description: "Change your profile card's background.",
            },
            {
                label: "List Backgrounds",
                value: "listBackgrounds",
                description:
                    "List all profile card backgrounds, including those that you own.",
            },
        ],
        "Choose what you want to customize."
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
