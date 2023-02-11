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
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { RequestResponse } from "@rian8337/osu-base";
import {
    ReplayAnalyzer,
    ReplayData,
} from "@rian8337/osu-droid-replay-analyzer";
import { Player } from "@rian8337/osu-droid-utilities";
import {
    Collection,
    GuildMember,
    EmbedBuilder,
    Snowflake,
    Attachment,
    bold,
} from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    username: 1,
                    uid: 1,
                    clan: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const replay: Attachment = interaction.options.getAttachment(
        "replay",
        true
    );

    const replayData: RequestResponse = await RESTManager.request(replay.url);

    if (replayData.statusCode !== 200) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("replayDownloadFail")
            ),
        });
    }

    const replayAnalyzer: ReplayAnalyzer = new ReplayAnalyzer({ scoreID: 0 });

    replayAnalyzer.originalODR = replayData.data;

    try {
        await replayAnalyzer.analyze();
    } catch {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("replayInvalid")
            ),
        });
    }

    const data: ReplayData = replayAnalyzer.data!;

    if (data.playerName !== bindInfo.username) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("replayDoesntHaveSameUsername")
            ),
        });
    }

    if (data.replayVersion < 3) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("replayTooOld")
            ),
        });
    }

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getFromHash(
            data.hash
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeFromReplayNotFound")
            ),
        });
    }

    if (!challenge.isOngoing) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotOngoing")
            ),
        });
    }

    const completionStatus: OperationResult =
        await challenge.checkReplayCompletion(
            replayAnalyzer,
            localization.language
        );

    if (!completionStatus.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotCompleted"),
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
        interaction.user,
        {
            projection: {
                _id: 0,
                challenges: 1,
                points: 1,
                alicecoins: 1,
            },
        }
    );

    // Ask for verification from staff
    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(localization.getTranslation("scoreStatistics"))
        .setDescription(
            `${bold(localization.getTranslation("totalScore"))}: ${
                data.score
            }\n` +
                `${bold(localization.getTranslation("maxCombo"))}: ${
                    data.maxCombo
                }x\n` +
                `${bold(localization.getTranslation("accuracy"))}: ${(
                    data.accuracy.value() * 100
                ).toFixed(2)}%\n` +
                `${bold(localization.getTranslation("rank"))}: ${data.rank}\n` +
                `${bold(
                    localization.getTranslation("time")
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    data.time,
                    localization.language
                )}\n\n` +
                `${bold(localization.getTranslation("hitGreat"))}: ${
                    data.accuracy.n300
                } (${data.hit300k} ${localization.getTranslation(
                    "geki"
                )} + ${localization.getTranslation("katu")})\n` +
                `${bold(localization.getTranslation("hitGood"))}: ${
                    data.accuracy.n100
                } (${data.hit100k} ${localization.getTranslation("katu")})\n` +
                `${bold(localization.getTranslation("hitMeh"))}: ${
                    data.accuracy.n50
                }\n` +
                `${bold(localization.getTranslation("misses"))}: ${
                    data.accuracy.nmiss
                }\n\n` +
                `${bold(
                    localization.getTranslation("bonusLevelReached")
                )}: ${bonusLevel}`
        );

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("manualSubmissionConfirmation")
            ),
            embeds: [embed],
        },
        [...staffMembers.keys()],
        30,
        localization.language
    );

    if (!confirmation) {
        return;
    }

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
                challengeData.highestLevel
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
                }
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
                }
            );
        }
    } else {
        const player: Player = (await Player.getInformation(bindInfo.uid))!;

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
                BCP47
            )
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
