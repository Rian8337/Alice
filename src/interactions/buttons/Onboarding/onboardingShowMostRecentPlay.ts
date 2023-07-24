import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { OnboardingShowMostRecentPlayLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingShowMostRecentPlay/OnboardingShowMostRecentPlayLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { MapInfo, Modes } from "@rian8337/osu-base";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { EmbedBuilder, GuildMember, InteractionReplyOptions } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingShowMostRecentPlayLocalization =
        new OnboardingShowMostRecentPlayLocalization(
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
            localization.getTranslation("recentPlayDisplay"),
            player.username
        ),
        embeds: [embed],
        ephemeral: true,
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

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
