import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { mapshareStrings } from "../mapshareStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (interaction.channelId !== Constants.mapShareChannel) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.notAvailableInChannelReject)
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(interaction.options.getString("beatmap", true))[0];

    if (!beatmapId) {
        return interaction.editReply({
            content: MessageCreator.createReject(mapshareStrings.noBeatmapFound)
        });
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(beatmapId);

    if (!submission) {
        return interaction.editReply({
            content: MessageCreator.createReject(mapshareStrings.noSubmissionWithBeatmap)
        });
    }

    if (submission.status !== "pending") {
        return interaction.editReply({
            content: MessageCreator.createReject(mapshareStrings.submissionIsNotPending)
        });
    }

    const result: DatabaseOperationResult = await submission.accept();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.acceptFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(mapshareStrings.acceptSuccess)
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"]
};