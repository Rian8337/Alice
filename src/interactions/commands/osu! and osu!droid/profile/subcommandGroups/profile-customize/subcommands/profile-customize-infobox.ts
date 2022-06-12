import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    CommandHelper.runSlashSubcommandNotFromInteraction(
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

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
