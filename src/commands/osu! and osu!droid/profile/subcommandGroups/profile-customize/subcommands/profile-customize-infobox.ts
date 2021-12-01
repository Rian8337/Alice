import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: "View Background Color",
                value: "viewInfoBoxBackgroundColor",
                description:
                    "View the background color of your profile card's information box.",
            },
            {
                label: "Change Background Color",
                value: "changeInfoBoxBackgroundColor",
                description:
                    "Change the background color of your profile card's information box.",
            },
            {
                label: "View Text Color",
                value: "viewInfoBoxTextColor",
                description:
                    "View the text color of your profile card's information box.",
            },
            {
                label: "Change Text Color",
                value: "changeInfoBoxTextColor",
                description:
                    "Change the text color of your profile card's information box.",
            },
        ],
        "Choose what you want to customize."
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
