import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MessageOptions } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { Language } from "@alice-localization/base/Language";
import { MapshareLocalization } from "@alice-localization/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MapshareLocalization = new MapshareLocalization(
        language
    );

    if (interaction.channelId !== Constants.mapShareChannel) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.notAvailableInChannelReject
                )
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapId) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(
            beatmapId
        );

    if (!submission) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noSubmissionWithBeatmap")
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapId,
        false
    );

    if (
        !beatmapInfo ||
        (beatmapInfo.hash !== submission.hash &&
            submission.status !== "pending")
    ) {
        await submission.delete();

        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapIsOutdated")
            ),
        });
    }

    const embedOptions: MessageOptions =
        (await EmbedCreator.createMapShareEmbed(submission, language))!;

    interaction.editReply(embedOptions);
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
