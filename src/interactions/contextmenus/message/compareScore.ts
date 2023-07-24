import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { MessageContextMenuCommand } from "structures/core/MessageContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { CompareScoreLocalization } from "@alice-localization/interactions/contextmenus/message/compareScore/CompareScoreLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, Modes } from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { EmbedBuilder, GuildMember, InteractionReplyOptions } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

export const run: MessageContextMenuCommand["run"] = async (_, interaction) => {
    const localization: CompareScoreLocalization = new CompareScoreLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const beatmapId: number | null = BeatmapManager.getBeatmapIDFromMessage(
        interaction.targetMessage
    );

    if (!beatmapId) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            }
        );

    if (!bindInfo) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapId,
        { checkFile: false }
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const score: Score | null = await Score.getFromHash(
        player.uid,
        beatmapInfo.hash
    );

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("scoreNotFound")
            ),
        });
    }

    BeatmapManager.setChannelLatestBeatmap(
        interaction.channelId,
        beatmapInfo.hash
    );

    const scoreAttribs: CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.scoreID,
        Modes.droid,
        PPCalculationMethod.live
    );

    const embed: EmbedBuilder = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        scoreAttribs,
        undefined,
        localization.language
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("comparePlayDisplay"),
            player.username
        ),
        embeds: [embed],
    };

    if (score.accuracy.nmiss > 0) {
        score.replay ??= new ReplayAnalyzer({ scoreID: score.scoreID });
        await ReplayHelper.analyzeReplay(score);

        if (!score.replay.data) {
            return InteractionHelper.reply(interaction, options);
        }

        const beatmapInfo: MapInfo<true> | null =
            await BeatmapManager.getBeatmap(score.hash, {
                checkFile: true,
            });

        if (beatmapInfo?.hasDownloadedBeatmap()) {
            MessageButtonCreator.createRecentScoreButton(
                interaction,
                options,
                beatmapInfo.beatmap,
                score.replay.data
            );
        } else {
            InteractionHelper.reply(interaction, options);
        }
    } else {
        InteractionHelper.reply(interaction, options);
    }
};

export const config: MessageContextMenuCommand["config"] = {
    name: "Compare Score",
};
