import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OnboardingShowRecentPlaysLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingShowRecentPlays/OnboardingShowRecentPlaysLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization = new OnboardingShowRecentPlaysLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
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

    const recentPlays = await ScoreHelper.getRecentScores(
        bindInfo.uid,
        player instanceof Player
            ? player.recentPlays
            : await DroidHelper.getRecentScores(
                  player.id,
                  undefined,
                  undefined,
                  [
                      "id",
                      "filename",
                      "mark",
                      "mode",
                      "score",
                      "combo",
                      "date",
                      "perfect",
                      "good",
                      "bad",
                      "miss",
                  ],
              ),
    );

    if (recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays"),
            ),
        });
    }

    ScoreDisplayHelper.showRecentPlays(
        interaction,
        player.username,
        recentPlays,
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
