import { MapInfo, MapStars, Player, rankedStatus, Score } from "osu-droid";
import { profileStrings } from "@alice-commands/osu! and osu!droid/profile/profileStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Collection } from "discord.js";
import { ProfileBadge } from "@alice-database/utils/aliceDb/ProfileBadge";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const playerInfoDbManager: PlayerInfoCollectionManager = DatabaseManager.aliceDb.collections.playerInfo;

    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(interaction.user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const badgeList: Collection<string, ProfileBadge> = await DatabaseManager.aliceDb.collections.profileBadges.get("id");

    const badgeID: string | undefined = (await SelectMenuCreator.createSelectMenu(
        interaction,
        "Choose the badge that you want to claim.",
        badgeList.map(v => {
            return {
                label: v.name,
                value: v.id
            };
        }),
        [interaction.user.id],
        30
    ))[0];

    if (!badgeID) {
        return;
    }

    const badge: ProfileBadge = badgeList.find(v => v.id === badgeID)!;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(interaction.user);

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ?? playerInfoDbManager.defaultDocument.picture_config;

    if (pictureConfig.badges.find(b => b.id === badge.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.badgeIsAlreadyClaimed)
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.profileNotFound, "your")
        });
    }

    let canUserClaimBadge: boolean = false;

    switch (badge.type) {
        case "dpp":
            canUserClaimBadge = bindInfo.pptotal >= badge.requirement;
            break;
        case "score_total":
            canUserClaimBadge = player.score >= badge.requirement;
            break;
        case "score_ranked":
            for await (const uid of bindInfo.previous_bind) {
                const rankedScoreInfo: RankedScore | null = await DatabaseManager.aliceDb.collections.rankedScore.getOne(
                    { uid: uid }, { projection: { _id: 0, uid: 1, level: 1, playc: 1, score: 1, username: 1 } }
                );

                if ((rankedScoreInfo?.score ?? 0) >= badge.requirement) {
                    canUserClaimBadge = true;
                    break;
                }
            }
            break;
        case "star_fc":
            const beatmapIDInput: string | undefined = await MessageInputCreator.createInputDetector(
                interaction,
                { embeds: [ EmbedCreator.createInputEmbed(
                    interaction,
                    "Claim a Profile Badge",
                    `Enter the beatmap ID or link that is at least ${badge.requirement}${Symbols.star} in PC rating and you have a full combo on.\n\nThe beatmap must be a ranked or approved beatmap.`
                ) ] },
                [],
                [interaction.user.id],
                20
            );

            if (!beatmapIDInput) {
                break;
            }

            const beatmapID = BeatmapManager.getBeatmapID(beatmapIDInput)[0];

            if (isNaN(beatmapID)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(profileStrings.beatmapToClaimBadgeNotValid)
                });
            }

            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(beatmapID, false);

            if (!beatmapInfo) {
                return interaction.editReply({
                    content: MessageCreator.createReject(profileStrings.beatmapToClaimBadgeNotFound)
                });
            }

            if (beatmapInfo.approved !== rankedStatus.RANKED && beatmapInfo.approved !== rankedStatus.APPROVED) {
                return interaction.editReply({
                    content: MessageCreator.createReject(profileStrings.beatmapToClaimBadgeNotRankedOrApproved)
                });
            }

            for await (const uid of bindInfo.previous_bind) {
                const score: Score = await Score.getFromHash({ uid: uid, hash: beatmapInfo.hash });

                if (!score.title) {
                    continue;
                }

                await beatmapInfo.retrieveBeatmapFile();

                const star: MapStars = new MapStars().calculate({ map: beatmapInfo.map!, mods: score.mods });

                if (star.pcStars.total >= badge.requirement) {
                    canUserClaimBadge = true;
                    break;
                }
            }

            if (!canUserClaimBadge) {
                return interaction.editReply({
                    content: MessageCreator.createReject(profileStrings.userDoesntHaveScoreinBeatmap)
                });
            }

            if (!beatmapInfo) {
                return;
            }

            break;
        case "unclaimable":
            return interaction.editReply({
                content: MessageCreator.createReject(profileStrings.badgeUnclaimable)
            });
    }

    if (!canUserClaimBadge) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.userCannotClaimBadge)
        });
    }

    pictureConfig.badges.push({
        id: badge.id,
        name: badge.name
    });

    if (playerInfo) {
        await playerInfoDbManager.update(
            { discordid: interaction.user.id }, { $set: { picture_config: pictureConfig } }
        );
    } else {
        await playerInfoDbManager.insert({
            discordid: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            picture_config: pictureConfig
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.claimBadgeSuccess,
            interaction.user.toString(),
            badge.id
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};