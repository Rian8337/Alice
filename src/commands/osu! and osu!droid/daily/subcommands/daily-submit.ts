import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ChallengeCompletionData } from "@alice-interfaces/challenge/ChallengeCompletionData";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/DailyLocalization";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Player, Score } from "@rian8337/osu-droid-utilities";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const type: ChallengeType =
        <ChallengeType>interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
            type
        );

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingChallenge")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    const score: Score | undefined = player.recentPlays.find(
        (s) => s.hash === challenge.hash
    );

    if (!score) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("scoreNotFound")
            ),
        });
    }

    const completionStatus: OperationResult =
        await challenge.checkScoreCompletion(score, localization.language);

    if (!completionStatus.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotCompleted"),
                completionStatus.reason!
            ),
        });
    }

    const bonusLevel: number = await challenge.calculateBonusLevel(score);

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user
    );

    // Keep track of how many points are gained
    let pointsGained: number = bonusLevel * 2 + challenge.points;

    if (playerInfo) {
        const challengeData: ChallengeCompletionData | undefined =
            playerInfo.challenges.get(challenge.challengeid);

        if (challengeData) {
            // Player has completed challenge. Subtract the challenge's original points
            // and difference from highest challenge level
            pointsGained -=
                challenge.points +
                (challengeData.highestLevel -
                    Math.max(0, bonusLevel - challengeData.highestLevel)) *
                    2;

            challengeData.highestLevel = Math.max(
                bonusLevel,
                challengeData.highestLevel
            );
        } else {
            playerInfo.challenges.set(challenge.challengeid, {
                id: challenge.challengeid,
                highestLevel: bonusLevel,
            });
        }

        await playerInfoDbManager.update(
            { discordid: interaction.user.id },
            {
                $set: {
                    challenges: [...playerInfo.challenges.values()],
                },
                $inc: {
                    alicecoins: pointsGained * 2,
                    points: pointsGained,
                },
            }
        );
    } else {
        await playerInfoDbManager.insert({
            uid: player.uid,
            username: player.username,
            discordid: interaction.user.id,
            points: pointsGained,
            alicecoins: pointsGained * 2,
            challenges: [
                {
                    id: challenge.challengeid,
                    highestLevel: bonusLevel,
                },
            ],
        });
    }

    if (bindInfo.clan) {
        const clan: Clan =
            (await DatabaseManager.elainaDb.collections.clan.getFromName(
                bindInfo.clan
            ))!;

        clan.incrementPower(pointsGained);

        await clan.updateClan();
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("challengeCompleted"),
            challenge.challengeid,
            bonusLevel.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            pointsGained.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            (pointsGained * 2).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            ((playerInfo?.points ?? 0) + pointsGained).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            ((playerInfo?.alicecoins ?? 0) + pointsGained * 2).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
