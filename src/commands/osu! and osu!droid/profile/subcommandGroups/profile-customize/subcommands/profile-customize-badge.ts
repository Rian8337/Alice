import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    CommandHelper.runSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: localization.getTranslation("showBadgeTemplateLabel"),
                value: "showBadgeTemplate",
                description: localization.getTranslation(
                    "showBadgeTemplateDescription"
                ),
            },
            {
                label: localization.getTranslation("claimBadgeLabel"),
                value: "claimBadge",
                description: localization.getTranslation(
                    "claimBadgeDescription"
                ),
            },
            {
                label: localization.getTranslation("equipBadgeLabel"),
                value: "equipBadge",
                description: localization.getTranslation(
                    "equipBadgeDescription"
                ),
            },
            {
                label: localization.getTranslation("unequipBadgeLabel"),
                value: "unequipBadge",
                description: localization.getTranslation(
                    "unequipBadgeDescription"
                ),
            },
            {
                label: localization.getTranslation("listBadgeLabel"),
                value: "listBadges",
                description: localization.getTranslation(
                    "listBadgeDescription"
                ),
            },
        ],
        localization.getTranslation("customizationPlaceholder")
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
