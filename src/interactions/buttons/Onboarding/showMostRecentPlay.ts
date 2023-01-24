import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ShowMostRecentPlayLocalization } from "@alice-localization/interactions/buttons/Onboarding/showMostRecentPlay/ShowMostRecentPlayLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { EmbedBuilder, GuildMember, InteractionReplyOptions } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: ShowMostRecentPlayLocalization =
        new ShowMostRecentPlayLocalization(
            await CommandHelper.getLocale(interaction)
        );

    await InteractionHelper.deferReply(interaction);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user.id,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBinded")
            ),
        });
    }

    const player: Player | null = await Player.getInformation(bindInfo.uid);
    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    if (player.recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays")
            ),
        });
    }

    const score: Score = player.recentPlays[0];
    const diffCalcHelper: DroidBeatmapDifficultyHelper =
        new DroidBeatmapDifficultyHelper();

    const perfCalcResult: PerformanceCalculationResult<
        DroidDifficultyCalculator,
        DroidPerformanceCalculator
    > | null = await diffCalcHelper.calculateScorePerformance(score);

    let diffCalculator: DroidDifficultyCalculator | undefined;

    if (perfCalcResult) {
        diffCalculator = perfCalcResult.requestedDifficultyCalculation()
            ? perfCalcResult.difficultyCalculator
            : (await diffCalcHelper.calculateScoreDifficulty(score))!.result;

        await DroidBeatmapDifficultyHelper.applyTapPenalty(
            score,
            diffCalculator,
            perfCalcResult
        );
    }

    const embed: EmbedBuilder = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        perfCalcResult?.result,
        undefined,
        localization.language
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("recentPlayDisplay"),
            player.username
        ),
        embeds: [embed],
        ephemeral: true,
    };

    if (diffCalculator && score.replay?.data && score.accuracy.nmiss > 0) {
        MessageButtonCreator.createMissAnalyzerButton(
            interaction,
            options,
            diffCalculator,
            score.replay.data
        );
    } else {
        InteractionHelper.reply(interaction, options);
    }
};

export const config: ButtonCommand["config"] = {
    name: "showMostRecentPlay",
    replyEphemeral: true,
};
