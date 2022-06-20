import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MapshareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TextInputComponent } from "discord.js";
import { TextInputStyles } from "discord.js/typings/enums";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        await CommandHelper.getLocale(interaction)
    );

    ModalCreator.createModal(
        interaction,
        "mapshare-submission",
        localization.getTranslation("submitModalTitle"),
        new TextInputComponent()
            .setCustomId("beatmap")
            .setRequired(true)
            .setStyle(TextInputStyles.SHORT)
            .setLabel(localization.getTranslation("submitModalBeatmapLabel"))
            .setPlaceholder(
                localization.getTranslation("submitModalBeatmapPlaceholder")
            ),
        new TextInputComponent()
            .setCustomId("summary")
            .setRequired(true)
            .setStyle(TextInputStyles.PARAGRAPH)
            .setLabel(localization.getTranslation("submitModalSummaryLabel"))
            .setPlaceholder(
                localization.getTranslation("submitModalSummaryPlaceholder")
            )
            .setMinLength(100)
            .setMaxLength(900)
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    instantDeferInDebug: false,
};
