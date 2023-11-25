import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ChallengeCompletionData } from "structures/challenge/ChallengeCompletionData";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { ChallengeType } from "structures/challenge/ChallengeType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Player, Score } from "@rian8337/osu-droid-utilities";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const type: ChallengeType =
        <ChallengeType>interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
            type,
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingChallenge"),
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
                    clan: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    const score: Score | undefined = player?.recentPlays.find(
        (s) => s.hash === challenge.hash,
    );

    if (!player || !score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("scoreNotFound"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const completionStatus: OperationResult =
        await challenge.checkScoreCompletion(
            score,
            undefined,
            localization.language,
        );

    if (!completionStatus.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotCompleted"),
                completionStatus.reason!,
            ),
        });
    }

    const bonusLevel: number = await challenge.calculateBonusLevel(score);

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                alicecoins: 1,
                points: 1,
                challenges: 1,
            },
        },
    );

    // Keep track of how many points are gained
    let pointsGained: number = bonusLevel * 2 + challenge.points;

    if (playerInfo) {
        const challengeData: ChallengeCompletionData =
            playerInfo.challenges.get(challenge.challengeid) ?? {
                id: challenge.challengeid,
                highestLevel: bonusLevel,
            };

        if (playerInfo.challenges.has(challenge.challengeid)) {
            // Player has completed challenge. Subtract the challenge's original points
            // and difference from highest challenge level
            pointsGained -=
                challenge.points +
                (challengeData.highestLevel -
                    Math.max(0, bonusLevel - challengeData.highestLevel)) *
                    2;

            challengeData.highestLevel = Math.max(
                bonusLevel,
                challengeData.highestLevel,
            );

            await playerInfoDbManager.updateOne(
                { discordid: interaction.user.id },
                {
                    $set: {
                        "challenges.$[challengeFilter].highestLevel":
                            challengeData.highestLevel,
                    },
                    $inc: {
                        alicecoins: pointsGained * 2,
                        points: pointsGained,
                    },
                },
                {
                    arrayFilters: [
                        { "challengeFilter.id": challenge.challengeid },
                    ],
                },
            );
        } else {
            playerInfo.challenges.set(challenge.challengeid, challengeData);

            await playerInfoDbManager.updateOne(
                { discordid: interaction.user.id },
                {
                    $push: {
                        challenges: challengeData,
                    },
                    $inc: {
                        alicecoins: pointsGained * 2,
                        points: pointsGained,
                    },
                },
            );
        }
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
                bindInfo.clan,
            ))!;

        clan.incrementPower(pointsGained);

        await clan.updateClan();
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("challengeCompleted"),
            challenge.challengeid,
            bonusLevel.toLocaleString(BCP47),
            pointsGained.toLocaleString(BCP47),
            (pointsGained * 2).toLocaleString(BCP47),
            ((playerInfo?.points ?? 0) + pointsGained).toLocaleString(BCP47),
            ((playerInfo?.alicecoins ?? 0) + pointsGained * 2).toLocaleString(
                BCP47,
            ),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
