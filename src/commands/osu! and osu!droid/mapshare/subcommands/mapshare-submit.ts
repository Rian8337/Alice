import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, rankedStatus } from "@rian8337/osu-base";
import { mapshareStrings } from "../mapshareStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
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

    const summary: string = interaction.options.getString("summary", true);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapId,
        false
    );

    if (!beatmapInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.noBeatmapFound
            ),
        });
    }

    if (beatmapInfo.totalDifficulty < 3) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapIsTooEasy
            ),
        });
    }

    if (beatmapInfo.objects < 50) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapHasLessThan50Objects
            ),
        });
    }

    if (beatmapInfo.circles + beatmapInfo.sliders === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapHasNoCirclesOrSliders
            ),
        });
    }

    if (beatmapInfo.hitLength < 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapDurationIsLessThan30Secs
            ),
        });
    }

    if (
        beatmapInfo.approved === rankedStatus.WIP ||
        beatmapInfo.approved === rankedStatus.QUALIFIED
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapIsWIPOrQualified
            ),
        });
    }

    if (beatmapInfo.approved !== rankedStatus.RANKED) {
        if (
            DateTimeFormatHelper.getTimeDifference(beatmapInfo.submitDate) >
            -86400 * 1000 * 7
        ) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    mapshareStrings.beatmapWasJustSubmitted
                ),
            });
        }

        if (
            DateTimeFormatHelper.getTimeDifference(beatmapInfo.lastUpdate) >
            -86400 * 1000 * 3
        ) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    mapshareStrings.beatmapWasJustUpdated
                ),
            });
        }
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(
            beatmapId
        );

    if (submission) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.beatmapHasBeenUsed
            ),
        });
    }

    const wordCount: number = summary.split(" ").length;

    if (wordCount < 50 || wordCount > 120) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.summaryWordCountNotValid,
                wordCount.toLocaleString()
            ),
        });
    }

    if (summary.length < 100 || summary.length > 900) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.summaryCharacterCountNotValid,
                summary.length.toLocaleString()
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    if (playerInfo) {
        await DatabaseManager.aliceDb.collections.playerInfo.update(
            { discordid: interaction.user.id },
            {
                $set: {
                    hasSubmittedMapShare: true,
                },
            }
        );
    } else {
        await DatabaseManager.aliceDb.collections.playerInfo.insert({
            uid: bindInfo.uid,
            username: bindInfo.username,
            discordid: bindInfo.discordid,
            hasSubmittedMapShare: true,
        });
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.mapShare.insert({
            beatmap_id: beatmapId,
            hash: beatmapInfo.hash,
            submitter: bindInfo.username,
            id: interaction.user.id,
            summary: summary,
        });

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.submitFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(mapshareStrings.submitSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
