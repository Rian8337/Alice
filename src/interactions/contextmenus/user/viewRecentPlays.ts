import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserContextMenuCommand } from "structures/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ViewRecentPlaysLocalization } from "@alice-localization/interactions/contextmenus/user/viewRecentPlays/ViewRecentPlaysLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { OfficialDatabaseScore } from "@alice-database/official/schema/OfficialDatabaseScore";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const localization = new ViewRecentPlaysLocalization(
        await CommandHelper.getLocale(interaction),
    );

    if (interaction.targetUser.bot) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.userNotBindedReject,
                ),
            ),
        });
    }

    const isSelfExecution = interaction.user.id === interaction.targetUser.id;

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser,
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
                new ConstantsLocalization(localization.language).getTranslation(
                    isSelfExecution
                        ? Constants.selfNotBindedReject
                        : Constants.userNotBindedReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    isSelfExecution
                        ? "selfProfileNotFound"
                        : "userProfileNotFound",
                ),
            ),
        });
    }

    let recentPlays: (
        | Pick<
              OfficialDatabaseScore,
              | "filename"
              | "mark"
              | "mode"
              | "score"
              | "combo"
              | "date"
              | "perfect"
              | "good"
              | "bad"
              | "miss"
          >
        | Score
        | RecentPlay
    )[];

    if (player instanceof Player) {
        recentPlays = player.recentPlays;
    } else {
        recentPlays = await DroidHelper.getRecentScores(
            player.id,
            undefined,
            undefined,
            [
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
        );
    }

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

export const config: UserContextMenuCommand["config"] = {
    name: "View Recent Plays",
    replyEphemeral: true,
};
