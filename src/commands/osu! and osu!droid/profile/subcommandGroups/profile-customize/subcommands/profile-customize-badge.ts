import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: "Show Badge Template",
                value: "showBadgeTemplate",
                description: "Show the template of badges in a profile card.",
            },
            {
                label: "Claim Badge",
                value: "claimBadge",
                description: "Claim a badge.",
            },
            {
                label: "Equip Badge",
                value: "equipBadge",
                description: "Equip a badge.",
            },
            {
                label: "Unequip Badge",
                value: "unequipBadge",
                description: "Unequip a badge.",
            },
            {
                label: "List Badges",
                value: "listBadges",
                description:
                    "List all profile card badges, including those that you own.",
            },
        ],
        "Choose what you want to customize."
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
