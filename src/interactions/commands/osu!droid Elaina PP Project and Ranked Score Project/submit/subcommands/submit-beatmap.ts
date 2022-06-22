import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { GuildMember, MessageEmbed } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Symbols } from "@alice-enums/utils/Symbols";
import { RankedScoreHelper } from "@alice-utils/helpers/RankedScoreHelper";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { RankedScoreCollectionManager } from "@alice-database/managers/aliceDb/RankedScoreCollectionManager";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { MapInfo } from "@rian8337/osu-base";
import { DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SubmitLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project and Ranked Score Project/submit/SubmitLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SubmitLocalization = new SubmitLocalization(
        await CommandHelper.getLocale(interaction)
    );

    await InteractionHelper.deferReply(interaction);

    const bindDbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;
    const rankedScoreDbManager: RankedScoreCollectionManager =
        DatabaseManager.aliceDb.collections.rankedScore;

    const bindInfo: UserBind | null = await bindDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                uid: 1,
                username: 1,
                pp: 1,
                pptotal: 1,
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

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapID) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID,
        false
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const score: Score | null = await Score.getFromHash(
        bindInfo.uid,
        beatmapInfo.hash
    );

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noScoreSubmitted")
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            score.uid
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidIsBanned")
            ),
        });
    }

    const submissionValidity: DPPSubmissionValidity =
        await DPPHelper.checkSubmissionValidity(score);

    switch (submissionValidity) {
        case DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapIsBlacklisted")
                ),
            });
        case DPPSubmissionValidity.BEATMAP_NOT_WHITELISTED:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapNotWhitelisted")
                ),
            });
        case DPPSubmissionValidity.BEATMAP_TOO_SHORT:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapTooShort")
                ),
            });
        case DPPSubmissionValidity.SCORE_USES_FORCE_AR:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("scoreUsesForceAR")
                ),
            });
        case DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "scoreUsesCustomSpeedMultiplier"
                    )
                ),
            });
    }

    // PP
    const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
        await new DroidBeatmapDifficultyHelper().calculateScorePerformance(
            score
        );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    let fieldContent: string = `${score.combo}x | ${(
        score.accuracy.value() * 100
    ).toFixed(2)}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | `;

    const currentTotalPP: number = bindInfo.pptotal;

    if (droidCalcResult) {
        DPPHelper.insertScore(bindInfo.pp, [
            DPPHelper.scoreToPPEntry(score, droidCalcResult),
        ]);

        await bindInfo.setNewDPPValue(bindInfo.pp, 1);

        const dpp: number = parseFloat(droidCalcResult.result.total.toFixed(2));

        fieldContent += `${dpp}pp`;
    }

    const totalPP: number = bindInfo.pptotal;

    const ppDiff: number = totalPP - currentTotalPP;

    embed.setDescription(
        `${localization.getTranslation("totalPP")}: **${totalPP.toFixed(
            2
        )}pp**\n` +
            `${localization.getTranslation("ppGained")}: **${ppDiff.toFixed(
                2
            )}pp**\n`
    );

    // Ranked score
    if (RankedScoreHelper.isBeatmapEligible(beatmapInfo.approved)) {
        const rankedScoreInfo: RankedScore | null =
            await rankedScoreDbManager.getFromUid(bindInfo.uid);

        const scoreDiff: number =
            score.score - (rankedScoreInfo?.scorelist?.get(score.hash) ?? 0);

        const BCP47: string = LocaleHelper.convertToBCP47(
            localization.language
        );

        fieldContent += `\n**${score.score.toLocaleString(
            BCP47
        )}** | *+${scoreDiff.toLocaleString(BCP47)}*`;

        const totalScore: number = (rankedScoreInfo?.score ?? 0) + scoreDiff;

        const level: number = RankedScoreHelper.calculateLevel(totalScore);
        const levelRemain: number = parseFloat(
            ((level - Math.floor(level)) * 100).toFixed(2)
        );

        embed.setDescription(
            embed.description! +
                `${localization.getTranslation(
                    "rankedScore"
                )}: **${totalScore.toLocaleString(BCP47)}**\n` +
                `${localization.getTranslation(
                    "scoreGained"
                )}: **${scoreDiff.toLocaleString(BCP47)}**\n` +
                `${localization.getTranslation("currentLevel")}: **${Math.floor(
                    level
                )} (${levelRemain}%)**${
                    (rankedScoreInfo?.level ?? 1) < Math.floor(level)
                        ? `\n${Symbols.upIcon} ${localization.getTranslation(
                              "levelUp"
                          )}`
                        : ""
                }\n` +
                `${localization.getTranslation("scoreNeeded")}: **${(
                    RankedScoreHelper.calculateScoreRequirement(
                        Math.floor(level) + 1
                    ) - totalScore
                ).toLocaleString(BCP47)}**`
        );

        if (rankedScoreInfo) {
            await rankedScoreInfo.addScores([score]);
        } else {
            await rankedScoreDbManager.insert({
                uid: bindInfo.uid,
                username: bindInfo.username,
                level: level,
                score: totalScore,
                scorelist: [[score.score, score.hash]],
                playc: 1,
            });
        }
    }

    // Finalization
    embed
        .setTitle(localization.getTranslation("ppSubmissionInfo"))
        .addField(
            `${beatmapInfo.fullTitle} +${
                score.mods.map((v) => v.acronym).join(",") || "No Mod"
            }`,
            fieldContent
        );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("submitSuccessful")
        ),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
