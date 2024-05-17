import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { Modes, RankedStatus } from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    const playerInfoDbManager = DatabaseManager.aliceDb.collections.playerInfo;

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    pptotal: 1,
                    previous_bind: 1,
                    username: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    const badgeList =
        await DatabaseManager.aliceDb.collections.profileBadges.get(
            "id",
            {},
            { projection: { _id: 0 } },
        );

    const selectMenuInteraction =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("chooseClaimBadge"),
                ),
            },
            badgeList
                .map((v) => {
                    return {
                        label: v.name,
                        value: v.id,
                    };
                })
                .sort((a, b) => a.label.localeCompare(b.label)),
            [interaction.user.id],
            30,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const badgeID = selectMenuInteraction.values[0];
    const badge = badgeList.get(badgeID)!;

    const playerInfo = await playerInfoDbManager.getFromUser(interaction.user, {
        projection: {
            _id: 0,
            picture_config: 1,
        },
    });

    const pictureConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    if (pictureConfig.badges.find((b) => b.id === badge.id)) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("badgeIsAlreadyClaimed"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, ["score"]);

    if (!player) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfProfileNotFound"),
            ),
        });
    }

    let canUserClaimBadge = false;

    switch (badge.type) {
        case "dpp":
            canUserClaimBadge = bindInfo.pptotal >= badge.requirement;
            break;
        case "score_total":
            canUserClaimBadge = player.score >= badge.requirement;
            break;
        case "star_fc": {
            const beatmapIDInput =
                await MessageInputCreator.createInputDetector(
                    interaction,
                    {
                        embeds: [
                            EmbedCreator.createInputEmbed(
                                interaction,
                                localization.getTranslation("claimBadge"),
                                `${StringHelper.formatString(
                                    localization.getTranslation("enterBeatmap"),
                                    Symbols.star,
                                    badge.requirement.toString(),
                                )}\n\n${localization.getTranslation(
                                    "enterBeatmapRestriction",
                                )}`,
                                localization.language,
                            ),
                        ],
                    },
                    [],
                    [interaction.user.id],
                    20,
                );

            if (!beatmapIDInput) {
                break;
            }

            const beatmapID = BeatmapManager.getBeatmapID(beatmapIDInput)[0];

            if (isNaN(beatmapID)) {
                return InteractionHelper.update(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "beatmapToClaimBadgeNotValid",
                        ),
                    ),
                });
            }

            const beatmapInfo = await BeatmapManager.getBeatmap(beatmapID, {
                checkFile: false,
            });

            if (!beatmapInfo) {
                return InteractionHelper.update(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "beatmapToClaimBadgeNotFound",
                        ),
                    ),
                });
            }

            if (
                beatmapInfo.approved !== RankedStatus.ranked &&
                beatmapInfo.approved !== RankedStatus.approved
            ) {
                return InteractionHelper.update(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "beatmapToClaimBadgeNotRankedOrApproved",
                        ),
                    ),
                });
            }

            for (const uid of bindInfo.previous_bind) {
                const score = await DroidHelper.getScore(
                    uid,
                    beatmapInfo.hash,
                    ["id"],
                );

                if (!score) {
                    continue;
                }

                const attribs =
                    await DPPProcessorRESTManager.getOnlineScoreAttributes(
                        score instanceof Score ? score.scoreID : score.id,
                        Modes.osu,
                        PPCalculationMethod.live,
                    );

                if (!attribs) {
                    continue;
                }

                if (attribs.difficulty.starRating >= badge.requirement) {
                    canUserClaimBadge = true;
                    break;
                }
            }

            if (!canUserClaimBadge) {
                return InteractionHelper.update(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "userDoesntHaveScoreinBeatmap",
                        ),
                    ),
                });
            }

            if (!beatmapInfo) {
                return;
            }

            break;
        }
        case "unclaimable":
            return InteractionHelper.update(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("badgeUnclaimable"),
                ),
            });
    }

    if (!canUserClaimBadge) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userCannotClaimBadge"),
            ),
        });
    }

    if (playerInfo) {
        await playerInfoDbManager.updateOne(
            { discordid: interaction.user.id },
            {
                $push: {
                    "picture_config.badges": { id: badge.id, name: badge.name },
                },
            },
        );
    } else {
        await playerInfoDbManager.insert({
            discordid: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            picture_config: pictureConfig,
        });
    }

    InteractionHelper.update(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("claimBadgeSuccess"),
            interaction.user.toString(),
            badge.id,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
