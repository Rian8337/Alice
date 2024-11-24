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
                label: localization.getTranslation("changeBackgroundLabel"),
                value: "changeBackground",
                description: localization.getTranslation(
                    "changeBackgroundDescription",
                ),
            },
            {
                label: localization.getTranslation("listBackgroundLabel"),
                value: "listBackgrounds",
                description: localization.getTranslation(
                    "listBackgroundDescription",
                ),
            },
        ],
        localization.getTranslation("customizationPlaceholder"),
    );
};
