import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ChallengeCompletionData } from "@alice-interfaces/challenge/ChallengeCompletionData";
import { ChallengeOperationResult } from "@alice-interfaces/challenge/ChallengeOperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildEmoji } from "discord.js";
import { Player, Score } from "osu-droid";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const type: ChallengeType = <ChallengeType> interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(type);

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.noOngoingChallenge)
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(interaction.user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    const score: Score | undefined = player.recentPlays.find(s => s.hash === challenge.hash);

    if (!score) {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.scoreNotFound)
        });
    }

    const completionStatus: ChallengeOperationResult = await challenge.checkScoreCompletion(score);

    if (!completionStatus.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.challengeNotCompleted, completionStatus.reason!
            )
        });
    }

    const bonusLevel: number = await challenge.calculateBonusLevel(score);

    const playerInfoDbManager: PlayerInfoCollectionManager = DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null =
        await playerInfoDbManager.getFromUser(interaction.user);

    // Keep track of how many levels are gained
    let levelGained: number = bonusLevel;

    if (playerInfo) {

        const challengeData: ChallengeCompletionData | undefined = playerInfo.challenges.get(challenge.challengeid);

        if (challengeData) {
            levelGained -= challengeData.highestLevel;

            challengeData.highestLevel = bonusLevel;
        } else {
            playerInfo.challenges.set(challenge.challengeid, { id: challenge.challengeid, highestLevel: bonusLevel });
        }

        if (levelGained) {
            await playerInfoDbManager.update(
                { discordid: interaction.user.id },
                {
                    $set: {
                        challenges: [...playerInfo.challenges.values()]
                    },
                    $inc: {
                        alicecoins: (levelGained + (challengeData ? challenge.points : 0)) * 2,
                        points: levelGained + (challengeData ? challenge.points : 0)
                    }
                }
            );
        }
    } else {
        await playerInfoDbManager.insert({
            uid: player.uid,
            username: player.username,
            discordid: interaction.user.id,
            points: levelGained,
            alicecoins: levelGained * 2,
            challenges: [
                {
                    id: challenge.challengeid,
                    highestLevel: bonusLevel
                }
            ]
        });
    }

    const coin: GuildEmoji = client.emojis.resolve(Constants.aliceCoinEmote)!;

    interaction.editReply({
        content: MessageCreator.createAccept(
            dailyStrings.challengeCompleted,
            challenge.challengeid,
            bonusLevel.toString(),
            levelGained.toString(),
            levelGained === 1 ? "" : "s",
            coin.toString(),
            (levelGained * 2).toString(),
            (playerInfo?.points ?? 0 + levelGained).toString(),
            (playerInfo?.points ?? 0 + levelGained) === 1 ? "" : "s",
            coin.toString(),
            (playerInfo?.alicecoins ?? 0 + levelGained * 2).toString()
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};