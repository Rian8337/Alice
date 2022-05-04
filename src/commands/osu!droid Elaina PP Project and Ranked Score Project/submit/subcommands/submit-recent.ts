import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { RankedScoreCollectionManager } from "@alice-database/managers/aliceDb/RankedScoreCollectionManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { RankedScoreHelper } from "@alice-utils/helpers/RankedScoreHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { MapInfo } from "@rian8337/osu-base";
import { DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { SubmitLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/submit/SubmitLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: SubmitLocalization = new SubmitLocalization(
        await CommandHelper.getLocale(interaction)
    );

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
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            player.uid
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidIsBanned")
            ),
        });
    }

    const submissionAmount: number = NumberHelper.clamp(
        interaction.options.getInteger("amount") ?? 1,
        1,
        5
    );
    const submissionOffset: number =
        interaction.options.getInteger("offset") ?? 1;

    const scoresToSubmit: Score[] = player.recentPlays.slice(
        submissionOffset - 1,
        submissionAmount + submissionOffset - 1
    );

    if (scoresToSubmit.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noScoresInSubmittedList")
            ),
        });
    }

    const rankedScoreInfo: RankedScore | null =
        await rankedScoreDbManager.getFromUid(bindInfo.uid);

    const scoreList: Collection<string, number> =
        rankedScoreInfo?.scorelist ?? new Collection();
    let totalScore: number = rankedScoreInfo?.score ?? 0;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    for (const score of scoresToSubmit) {
        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash,
            false
        );
        const fieldTitle: string = `${beatmapInfo?.fullTitle ?? score.title} +${
            score.mods.map((v) => v.acronym).join(",") || "No Mod"
        }`;
        let fieldContent: string = `${score.combo}x | ${(
            score.accuracy.value() * 100
        ).toFixed(2)}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | **`;

        if (!beatmapInfo) {
            embed.addField(
                fieldTitle,
                fieldContent +
                    localization.getTranslation("beatmapNotFound") +
                    "**"
            );
            continue;
        }

        // PP
        const submissionValidity: DPPSubmissionValidity =
            await DPPHelper.checkSubmissionValidity(score);

        switch (submissionValidity) {
            case DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED:
                fieldContent += localization.getTranslation(
                    "blacklistedBeatmapReject"
                );
                break;
            case DPPSubmissionValidity.BEATMAP_NOT_WHITELISTED:
                fieldContent += localization.getTranslation(
                    "unrankedBeatmapReject"
                );
                break;
            case DPPSubmissionValidity.BEATMAP_TOO_SHORT:
                fieldContent += localization.getTranslation(
                    "beatmapTooShortReject"
                );
                break;
            case DPPSubmissionValidity.SCORE_USES_FORCE_AR:
            case DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED:
                fieldContent += localization.getTranslation(
                    "unrankedFeaturesReject"
                );
                break;
            default: {
                const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
                    await DroidBeatmapDifficultyHelper.calculateScorePerformance(
                        score
                    );

                if (!droidCalcResult) {
                    fieldContent += localization.getTranslation(
                        "beatmapNotFoundReject"
                    );
                    break;
                }

                DPPHelper.insertScore(bindInfo.pp, score, droidCalcResult);

                const dpp: number = parseFloat(
                    droidCalcResult.result.total.toFixed(2)
                );

                fieldContent += `${dpp}pp`;
            }
        }

        fieldContent += "**\n";

        // Ranked score
        if (RankedScoreHelper.isBeatmapEligible(beatmapInfo.approved)) {
            const scoreDiff: number = RankedScoreHelper.insertScore(
                scoreList,
                score
            );

            fieldContent += `**${score.score.toLocaleString(
                BCP47
            )}** | *+${scoreDiff.toLocaleString(BCP47)}*`;
            totalScore += scoreDiff;
        }

        embed.addField(fieldTitle, fieldContent);
    }

    // Finalization
    const totalPP: number = DPPHelper.calculateFinalPerformancePoints(
        bindInfo.pp
    );
    const ppDiff: number = totalPP - bindInfo.pptotal;

    const level: number = RankedScoreHelper.calculateLevel(totalScore);
    const levelRemain: number = parseFloat(
        ((level - Math.floor(level)) * 100).toFixed(2)
    );
    const scoreDiff: number = totalScore - (rankedScoreInfo?.score ?? 0);

    embed.setDescription(
        `${localization.getTranslation("totalPP")}: **${totalPP.toFixed(
            2
        )}pp**\n` +
            `${localization.getTranslation("ppGained")}: **${ppDiff.toFixed(
                2
            )}pp**\n` +
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
                      )}!`
                    : ""
            }\n` +
            `${localization.getTranslation("scoreNeeded")}: **${(
                RankedScoreHelper.calculateScoreRequirement(
                    Math.floor(level) + 1
                ) - totalScore
            ).toLocaleString(BCP47)}**`
    );

    await bindInfo.setNewDPPValue(bindInfo.pp, scoresToSubmit.length);

    if (rankedScoreInfo) {
        await rankedScoreInfo.setNewRankedScoreValue(
            scoreList,
            scoresToSubmit.length
        );
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
