import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MessageOptions } from "discord.js";
import { MapInfo } from "osu-droid";
import { mapshareStrings } from "../mapshareStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (interaction.channelId !== Constants.mapShareChannel) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                Constants.notAvailableInChannelReject
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapId) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.noBeatmapFound
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
                mapshareStrings.noSubmissionWithBeatmap
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
                mapshareStrings.beatmapIsOutdated
            ),
        });
    }

    const embedOptions: MessageOptions =
        (await EmbedCreator.createMapShareEmbed(submission))!;

    interaction.editReply(embedOptions);
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
