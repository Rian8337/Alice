import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MapshareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        await CommandHelper.getLocale(interaction)
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
                localization.getTranslation("submitModalBeatmapPlaceholder")
            ),
        new TextInputBuilder()
            .setCustomId("summary")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
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
