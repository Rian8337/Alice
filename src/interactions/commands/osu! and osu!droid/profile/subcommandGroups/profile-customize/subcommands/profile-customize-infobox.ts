import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    CommandHelper.runSlashSubcommandNotFromInteraction(
        interaction,
        __dirname,
        [
            {
                label: localization.getTranslation("viewBackgroundColorLabel"),
                value: "viewInfoBoxBackgroundColor",
                description: localization.getTranslation(
                    "viewBackgroundColorDescription",
                ),
            },
            {
                label: localization.getTranslation(
                    "changeBackgroundColorLabel",
                ),
                value: "changeInfoBoxBackgroundColor",
                description: localization.getTranslation(
                    "changeBackgroundColorDescription",
                ),
            },
            {
                label: localization.getTranslation("viewTextColorLabel"),
                value: "viewInfoBoxTextColor",
                description: localization.getTranslation(
                    "viewTextColorDescription",
                ),
            },
            {
                label: localization.getTranslation("changeTextColorLabel"),
                value: "changeInfoBoxTextColor",
                description: localization.getTranslation(
                    "changeTextColorDescription",
                ),
            },
        ],
        localization.getTranslation("customizationPlaceholder"),
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
