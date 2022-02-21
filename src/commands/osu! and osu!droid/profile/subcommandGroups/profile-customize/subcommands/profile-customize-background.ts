import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/ProfileLocalization";
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

export const config: Subcommand["config"] = {
    permissions: [],
};
