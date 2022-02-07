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
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { RequestResponse } from "@rian8337/osu-base";
import {
    ReplayAnalyzer,
    ReplayData,
} from "@rian8337/osu-droid-replay-analyzer";
import { Player } from "@rian8337/osu-droid-utilities";
import { Collection, GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const url: string = interaction.options.getString("replayurl", true);

    if (!StringHelper.isValidURL(url)) {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.invalidReplayURL),
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

    const replayData: RequestResponse = await RESTManager.request(url);

    if (replayData.statusCode !== 200) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.replayDownloadFail
            ),
        });
    }

    const replayAnalyzer: ReplayAnalyzer = new ReplayAnalyzer({ scoreID: 0 });

    replayAnalyzer.originalODR = replayData.data;

    try {
        await replayAnalyzer.analyze();
    } catch {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.replayInvalid),
        });
    }

    const data: ReplayData = replayAnalyzer.data!;

    if (data.playerName !== bindInfo.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.replayDoesntHaveSameUsername
            ),
        });
    }

    if (data.replayVersion < 3) {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.replayTooOld),
        });
    }

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getFromHash(
            data.hash
        );

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.challengeFromReplayNotFound
            ),
        });
    }

    if (!challenge.isOngoing) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.challengeNotOngoing
            ),
        });
    }

    const completionStatus: OperationResult =
        await challenge.checkReplayCompletion(replayAnalyzer);

    if (!completionStatus.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.challengeNotCompleted,
                completionStatus.reason!
            ),
        });
    }

    const bonusLevel: number = await challenge.calculateBonusLevel(
        replayAnalyzer
    );

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user
    );

    // Ask for verification from staff
    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle("Score Statistics")
        .setDescription(
            `**Total Score**: ${data.score}\n` +
                `**Max Combo**: ${data.maxCombo}x\n` +
                `**Accuracy**: ${(data.accuracy.value() * 100).toFixed(2)}%\n` +
                `**Rank**: ${data.rank}\n` +
                `**Time**: ${data.time.toUTCString()}\n\n` +
                `**Hit Great (300)**: ${data.accuracy.n300} (${data.hit300k} geki and katu)\n` +
                `**Hit good (100)**: ${data.accuracy.n100} (${data.hit100k} katu)\n` +
                `**Hit meh (50)**: ${data.accuracy.n50}\n` +
                `**Misses**: ${data.accuracy.nmiss}\n\n` +
                `**Bonus Level Reached**: ${bonusLevel}`
        );

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                dailyStrings.manualSubmissionConfirmation
            ),
            embeds: [embed],
        },
        [...staffMembers.keys()],
        30
    );

    if (!confirmation) {
        return;
    }

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
        const player: Player = await Player.getInformation({
            uid: bindInfo.uid,
        });

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
            dailyStrings.challengeCompleted,
            challenge.challengeid,
            bonusLevel.toLocaleString(),
            pointsGained.toLocaleString(),
            (pointsGained * 2).toLocaleString(),
            ((playerInfo?.points ?? 0) + pointsGained).toLocaleString(),
            ((playerInfo?.alicecoins ?? 0) + pointsGained * 2).toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
