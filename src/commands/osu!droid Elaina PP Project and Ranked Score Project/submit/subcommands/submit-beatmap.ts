import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
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
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SubmitLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/submit/SubmitLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: SubmitLocalization = new SubmitLocalization(language);

    const bindDbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;
    const rankedScoreDbManager: RankedScoreCollectionManager =
        DatabaseManager.aliceDb.collections.rankedScore;

    const bindInfo: UserBind | null = await bindDbManager.getFromUser(
        interaction.user
    );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
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

    const score: Score = await Score.getFromHash({
        uid: bindInfo.uid,
        hash: beatmapInfo.hash,
    });

    if (!score.title) {
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
        await DroidBeatmapDifficultyHelper.calculateScorePerformance(score);

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    let fieldContent: string = `${score.combo}x | ${(
        score.accuracy.value() * 100
    ).toFixed(2)}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | `;

    if (droidCalcResult) {
        DPPHelper.insertScore(bindInfo.pp, score, droidCalcResult);

        const dpp: number = parseFloat(droidCalcResult.result.total.toFixed(2));

        fieldContent += `${dpp}pp`;
    }

    const currentTotalPP: number = bindInfo.pptotal;

    if (droidCalcResult) {
        await bindInfo.setNewDPPValue(bindInfo.pp, 1);
    }

    const totalPP: number = DPPHelper.calculateFinalPerformancePoints(
        bindInfo.pp
    );

    const ppDiff: number = totalPP - currentTotalPP;

    embed.setDescription(
        `**${localization.getTranslation("totalPP")}**: ${totalPP.toFixed(
            2
        )}pp\n` +
            `**${localization.getTranslation("ppGained")}**: ${ppDiff.toFixed(
                2
            )} pp\n`
    );

    // Ranked score
    if (RankedScoreHelper.isBeatmapEligible(beatmapInfo.approved)) {
        const rankedScoreInfo: RankedScore | null =
            await rankedScoreDbManager.getFromUid(bindInfo.uid);

        const scoreList: Collection<string, number> =
            rankedScoreInfo?.scorelist ?? new Collection();

        const scoreDiff: number = RankedScoreHelper.insertScore(
            scoreList,
            score
        );

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
                `**${localization.getTranslation(
                    "rankedScore"
                )}**: ${totalScore.toLocaleString(BCP47)}\n` +
                `**${localization.getTranslation(
                    "scoreGained"
                )}**: ${scoreDiff.toLocaleString(BCP47)}\n` +
                `**${localization.getTranslation(
                    "currentLevel"
                )}**: ${Math.floor(level)} (${levelRemain}%)${
                    (rankedScoreInfo?.level ?? 1) > Math.floor(level)
                        ? `\n${Symbols.upIcon} ${localization.getTranslation(
                              "levelUp"
                          )}!`
                        : ""
                }\n` +
                `**${localization.getTranslation("scoreNeeded")}**: ${(
                    RankedScoreHelper.calculateScoreRequirement(
                        Math.floor(level) + 1
                    ) - totalScore
                ).toLocaleString(BCP47)}`
        );

        if (rankedScoreInfo) {
            await rankedScoreInfo.setNewRankedScoreValue(scoreList, 1);
        } else {
            await rankedScoreDbManager.insert({
                uid: bindInfo.uid,
                username: bindInfo.username,
                level: level,
                score: totalScore,
                scorelist: RankedScoreHelper.toArray(scoreList),
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

export const config: Subcommand["config"] = {
    permissions: [],
};
