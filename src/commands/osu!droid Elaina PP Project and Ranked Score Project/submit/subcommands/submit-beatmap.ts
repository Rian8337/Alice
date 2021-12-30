import { DroidPerformanceCalculator, MapInfo, Score } from "osu-droid";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { submitStrings } from "../submitStrings";
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

export const run: Subcommand["run"] = async (_, interaction) => {
    const bindDbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;
    const rankedScoreDbManager: RankedScoreCollectionManager =
        DatabaseManager.aliceDb.collections.rankedScore;

    const bindInfo: UserBind | null = await bindDbManager.getFromUser(
        interaction.user
    );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapID) {
        return interaction.editReply({
            content: MessageCreator.createReject(submitStrings.beatmapNotFound),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID,
        false
    );

    if (!beatmapInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(submitStrings.beatmapNotFound),
        });
    }

    const score: Score = await Score.getFromHash({
        uid: bindInfo.uid,
        hash: beatmapInfo.hash,
    });

    if (!score.title) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                submitStrings.noScoreSubmitted
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            score.uid
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(submitStrings.uidIsBanned),
        });
    }

    const submissionValidity: DPPSubmissionValidity =
        await DPPHelper.checkSubmissionValidity(score);

    switch (submissionValidity) {
        case DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED:
            return interaction.editReply({
                content: MessageCreator.createReject(
                    submitStrings.beatmapIsBlacklisted
                ),
            });
        case DPPSubmissionValidity.BEATMAP_NOT_WHITELISTED:
            return interaction.editReply({
                content: MessageCreator.createReject(
                    submitStrings.beatmapNotWhitelisted
                ),
            });
        case DPPSubmissionValidity.SCORE_USES_FORCE_AR:
            return interaction.editReply({
                content: MessageCreator.createReject(
                    submitStrings.scoreUsesForceAR
                ),
            });
        case DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED:
            return interaction.editReply({
                content: MessageCreator.createReject(
                    submitStrings.scoreUsesCustomSpeedMultiplier
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
        `**Total PP**: ${totalPP.toFixed(2)}pp\n` +
        `**PP gained**: ${ppDiff.toFixed(2)} pp\n`
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

        fieldContent += `\n**${score.score.toLocaleString()}** | *+${scoreDiff.toLocaleString()}*`;

        const totalScore: number = (rankedScoreInfo?.score ?? 0) + scoreDiff;

        const level: number = RankedScoreHelper.calculateLevel(totalScore);
        const levelRemain: number = parseFloat(
            ((level - Math.floor(level)) * 100).toFixed(2)
        );

        embed.setDescription(
            embed.description! +
            `**Ranked score**: ${totalScore.toLocaleString()}\n` +
            `**Score gained**: ${scoreDiff.toLocaleString()}\n` +
            `**Current level**: ${Math.floor(level)} (${levelRemain}%)${(rankedScoreInfo?.level ?? 1) > Math.floor(level)
                ? `\n${Symbols.upIcon} Level up!`
                : ""
            }\n` +
            `**Score needed to level up**: ${(
                RankedScoreHelper.calculateScoreRequirement(
                    Math.floor(level) + 1
                ) - totalScore
            ).toLocaleString()}`
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
        .setTitle("PP submission info")
        .addField(
            `${beatmapInfo.fullTitle} +${score.mods.map((v) => v.acronym).join(",") || "No Mod"
            }`,
            fieldContent
        );

    interaction.editReply({
        content: MessageCreator.createAccept(submitStrings.submitSuccessful),
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
