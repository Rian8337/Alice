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
import { MapInfo } from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { EmbedBuilder, GuildMember, InteractionReplyOptions } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";

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

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
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

    const droidCalcResult: PerformanceCalculationResult<
        DroidDifficultyCalculator,
        DroidPerformanceCalculator
    > | null = await new DroidBeatmapDifficultyHelper().calculateScorePerformance(
        score
    );

    const embed: EmbedBuilder = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        droidCalcResult,
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

    if (
        droidCalcResult !== null &&
        droidCalcResult.replay?.data &&
        (NumberHelper.isNumberInRange(score.accuracy.nmiss, 1, 5, true) ||
            (score.accuracy.nmiss > 0 &&
                CommandHelper.isExecutedByBotOwner(interaction)))
    ) {
        MessageButtonCreator.createMissAnalyzerButton(
            interaction,
            options,
            droidCalcResult.result.difficultyCalculator,
            droidCalcResult.replay.data
        );
    } else {
        InteractionHelper.reply(interaction, options);
    }
};

export const config: MessageContextMenuCommand["config"] = {
    name: "Compare Score",
};
