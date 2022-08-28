import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ModalCommand } from "structures/core/ModalCommand";
import { OperationResult } from "structures/core/OperationResult";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MapshareSubmissionLocalization } from "@alice-localization/interactions/modals/osu! and osu!droid/mapshare-postsubmission/MapshareSubmissionLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, rankedStatus } from "@rian8337/osu-base";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: MapshareSubmissionLocalization =
        new MapshareSubmissionLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.fields.getTextInputValue("beatmap")
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    const summary: string = interaction.fields.getTextInputValue("summary");

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    username: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapId,
        { checkFile: false }
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    if (beatmapInfo.totalDifficulty < 3) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapIsTooEasy")
            ),
        });
    }

    if (beatmapInfo.objects < 50) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapHasLessThan50Objects")
            ),
        });
    }

    if (beatmapInfo.circles + beatmapInfo.sliders === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapHasNoCirclesOrSliders")
            ),
        });
    }

    if (beatmapInfo.hitLength < 30) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapDurationIsLessThan30Secs")
            ),
        });
    }

    if (
        beatmapInfo.approved === rankedStatus.WIP ||
        beatmapInfo.approved === rankedStatus.QUALIFIED
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapIsWIPOrQualified")
            ),
        });
    }

    if (beatmapInfo.approved !== rankedStatus.RANKED) {
        if (
            DateTimeFormatHelper.getTimeDifference(beatmapInfo.submitDate) >
            -86400 * 1000 * 7
        ) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapWasJustSubmitted")
                ),
            });
        }

        if (
            DateTimeFormatHelper.getTimeDifference(beatmapInfo.lastUpdate) >
            -86400 * 1000 * 3
        ) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapWasJustUpdated")
                ),
            });
        }
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(
            beatmapId
        );

    if (submission) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapHasBeenUsed")
            ),
        });
    }

    const wordCount: number = summary.split(/\s+/g).length;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (wordCount < 50 || wordCount > 120) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("summaryWordCountNotValid"),
                wordCount.toLocaleString(BCP47)
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 1,
                },
            }
        );

    if (playerInfo) {
        await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("submitFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("submitSuccess")
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
