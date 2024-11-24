import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MapshareLocalization } from "@localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { ModalCreator } from "@utils/creators/ModalCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        CommandHelper.getLocale(interaction),
    );

    ModalCreator.createModal(
        interaction,
        "mapshare-submission",
        localization.getTranslation("submitModalTitle"),
        new TextInputBuilder()
            .setCustomId("beatmap")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setLabel(localization.getTranslation("submitModalBeatmapLabel"))
            .setPlaceholder(
                localization.getTranslation("submitModalBeatmapPlaceholder"),
            ),
        new TextInputBuilder()
            .setCustomId("summary")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setLabel(localization.getTranslation("submitModalSummaryLabel"))
            .setPlaceholder(
                localization.getTranslation("submitModalSummaryPlaceholder"),
            )
            .setMinLength(100)
            .setMaxLength(900),
    );
};

export const config: SlashSubcommand["config"] = {
    instantDeferInDebug: false,
};
