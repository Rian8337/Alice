import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { OnboardingShowMostRecentPlayLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingShowMostRecentPlay/OnboardingShowMostRecentPlayLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { Modes } from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { InteractionReplyOptions } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new OnboardingShowMostRecentPlayLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user.id,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBinded"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const recentPlays =
        player instanceof Player
            ? player.recentPlays
            : await DroidHelper.getRecentScores(player.id, 1, undefined, [
                  "id",
                  "uid",
                  "hash",
                  "score",
                  "filename",
                  "hash",
                  "mode",
                  "combo",
                  "mark",
                  "perfect",
                  "good",
                  "bad",
                  "miss",
                  "date",
              ]);

    if (recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays"),
            ),
        });
    }

    const score = recentPlays[0];

    const scoreAttribs = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.uid,
        score.hash,
        Modes.droid,
        PPCalculationMethod.live,
    );

    const embed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player instanceof Player
            ? player.avatarURL
            : DroidHelper.getAvatarURL(player.id),
        interaction.member.displayColor,
        scoreAttribs?.attributes,
        undefined,
        localization.language,
    );

    const options: InteractionReplyOptions = {
        content: MessageCreator.createAccept(
            localization.getTranslation("recentPlayDisplay"),
            player.username,
        ),
        embeds: [embed],
        ephemeral: true,
    };

    if ((score instanceof Score ? score.accuracy.nmiss : score.miss) > 0) {
        const replay = await ReplayHelper.analyzeReplay(score);

        if (!replay.data) {
            return InteractionHelper.reply(interaction, options);
        }

        const beatmapInfo = await BeatmapManager.getBeatmap(score.hash, {
            checkFile: true,
        });

        if (beatmapInfo?.hasDownloadedBeatmap()) {
            MessageButtonCreator.createRecentScoreButton(
                interaction,
                options,
                beatmapInfo.beatmap,
                replay.data,
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
