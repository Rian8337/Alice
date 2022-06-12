import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
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
                label: localization.getTranslation("changeBackgroundLabel"),
                value: "changeBackground",
                description: localization.getTranslation(
                    "changeBackgroundDescription"
                ),
            },
            {
                label: localization.getTranslation("listBackgroundLabel"),
                value: "listBackgrounds",
                description: localization.getTranslation(
                    "listBackgroundDescription"
                ),
            },
        ],
        localization.getTranslation("customizationPlaceholder")
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
