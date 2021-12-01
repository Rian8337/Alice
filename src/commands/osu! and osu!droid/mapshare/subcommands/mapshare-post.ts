import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
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

    const result: OperationResult = await submission.post();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.postFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(mapshareStrings.postSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
