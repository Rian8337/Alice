import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    CommandHelper.runSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: localization.getTranslation("viewBackgroundColorLabel"),
                value: "viewInfoBoxBackgroundColor",
                description: localization.getTranslation(
                    "viewBackgroundColorDescription"
                ),
            },
            {
                label: localization.getTranslation(
                    "changeBackgroundColorLabel"
                ),
                value: "changeInfoBoxBackgroundColor",
                description: localization.getTranslation(
                    "changeBackgroundColorDescription"
                ),
            },
            {
                label: localization.getTranslation("viewTextColorLabel"),
                value: "viewInfoBoxTextColor",
                description: localization.getTranslation(
                    "viewTextColorDescription"
                ),
            },
            {
                label: localization.getTranslation("changeTextColorLabel"),
                value: "changeInfoBoxTextColor",
                description: localization.getTranslation(
                    "changeTextColorDescription"
                ),
            },
        ],
        localization.getTranslation("customizationPlaceholder")
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
