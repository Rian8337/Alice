import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { ScoreRank } from "@alice-types/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Collection, MessageEmbed, MessageOptions } from "discord.js";
import { leaderboardStrings } from "../leaderboardStrings";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
import { Score } from "@rian8337/osu-droid-utilities";
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidPerformanceCalculator,
    OsuPerformanceCalculator,
    DroidStarRating,
    OsuStarRating,
} from "@rian8337/osu-difficulty-calculator";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? ""
    )[0];

    const hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(
        interaction.channel!.id
    );

    const page: number = interaction.options.getInteger("page") ?? 1;

    if (!beatmapID && !hash) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                leaderboardStrings.noBeatmapFound
            ),
        });
    }

    if (!NumberHelper.isPositive(page)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                leaderboardStrings.invalidPage
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID ?? hash,
        false
    );

    if (beatmapInfo) {
        BeatmapManager.setChannelLatestBeatmap(
            interaction.channelId,
            beatmapInfo.hash
        );
    }

    // Leaderboard cache, mapped by page number
    const leaderboardCache: Collection<number, Score[]> = new Collection();

    // Calculation cache, mapped by score ID
    const droidCalculationCache: Collection<
        number,
        PerformanceCalculationResult<DroidPerformanceCalculator> | null
    > = new Collection();
    const osuCalculationCache: Collection<
        number,
        PerformanceCalculationResult<OsuPerformanceCalculator> | null
    > = new Collection();

    // Check first page first for score availability
    const firstPageScores: Score[] = await ScoreHelper.fetchDroidLeaderboard(
        beatmapInfo?.hash ?? hash!
    );

    if (!firstPageScores[0]) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                leaderboardStrings.beatmapHasNoScores
            ),
        });
    }

    leaderboardCache.set(1, firstPageScores);

    const arrow: Symbols = Symbols.rightArrowSmall;

    const getCalculationResult = async (
        score: Score
    ): Promise<
        [
            PerformanceCalculationResult<DroidPerformanceCalculator> | null,
            PerformanceCalculationResult<OsuPerformanceCalculator> | null
        ]
    > => {
        const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
            beatmapInfo
                ? droidCalculationCache.get(score.scoreID) ??
                  (await DroidBeatmapDifficultyHelper.calculateScorePerformance(
                      score,
                      false
                  ))
                : null;

        const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
            beatmapInfo
                ? osuCalculationCache.get(score.scoreID) ??
                  (await OsuBeatmapDifficultyHelper.calculateScorePerformance(
                      score
                  ))
                : null;

        if (!droidCalculationCache.has(score.scoreID)) {
            droidCalculationCache.set(score.scoreID, droidCalcResult);
        }

        if (!osuCalculationCache.has(score.scoreID)) {
            osuCalculationCache.set(score.scoreID, osuCalcResult);
        }

        return [droidCalcResult, osuCalcResult];
    };

    const getScoreDescription = async (score: Score): Promise<string> => {
        const calcResult: [
            PerformanceCalculationResult<DroidPerformanceCalculator> | null,
            PerformanceCalculationResult<OsuPerformanceCalculator> | null
        ] = await getCalculationResult(score);

        return (
            `${arrow} **${BeatmapManager.getRankEmote(
                <ScoreRank>score.rank
            )}** ${
                calcResult[0] && calcResult[1]
                    ? `${arrow} **${calcResult[0].result.total.toFixed(
                          2
                      )}DPP | ${calcResult[1].result.total.toFixed(2)}PP**`
                    : ""
            } ${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
            `${arrow} ${score.score.toLocaleString()} ${arrow} ${
                score.combo
            }x ${arrow} [${score.accuracy.n300}/${score.accuracy.n100}/${
                score.accuracy.n50
            }/${score.accuracy.nmiss}]\n` +
            `\`${score.date.toUTCString()}\``
        );
    };

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const actualPage: number = Math.floor((page - 1) / 20);

        const pageRemainder: number = (page - 1) % 20;

        const scores: Score[] =
            leaderboardCache.get(actualPage) ??
            (await ScoreHelper.fetchDroidLeaderboard(
                beatmapInfo?.hash ?? hash!,
                page
            ));

        if (!leaderboardCache.has(actualPage)) {
            leaderboardCache.set(actualPage, scores);
        }

        const noModCalcParams: StarRatingCalculationParameters =
            new StarRatingCalculationParameters();

        const noModDroidCalcResult: StarRatingCalculationResult<DroidStarRating> | null =
            beatmapInfo
                ? await DroidBeatmapDifficultyHelper.calculateBeatmapDifficulty(
                      beatmapInfo.hash,
                      noModCalcParams
                  )
                : null;

        const noModOsuCalcResult: StarRatingCalculationResult<OsuStarRating> | null =
            beatmapInfo
                ? await OsuBeatmapDifficultyHelper.calculateBeatmapDifficulty(
                      beatmapInfo.hash,
                      noModCalcParams
                  )
                : null;

        const embedOptions: MessageOptions = beatmapInfo
            ? EmbedCreator.createBeatmapEmbed(beatmapInfo)
            : { embeds: [EmbedCreator.createNormalEmbed()] };

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

        const topScore: Score = leaderboardCache.get(1)![0];

        if (!embed.title) {
            embed.setTitle(topScore.title);
        } else if (noModDroidCalcResult && noModOsuCalcResult) {
            embed.setTitle(
                embed.title +
                    ` [${noModDroidCalcResult.result.total.toFixed(2)}${
                        Symbols.star
                    } | ${noModOsuCalcResult.result.total.toFixed(2)}${
                        Symbols.star
                    }]`
            );
        }

        embed.addField(
            "**Top Score**",
            `**${topScore.username}${
                topScore.mods.length > 0
                    ? ` (${topScore.getCompleteModString()})`
                    : ""
            }**\n` + (await getScoreDescription(topScore))
        );

        const displayedScores: Score[] = scores.slice(
            5 * pageRemainder,
            5 + 5 * pageRemainder
        );

        let i = 20 * actualPage + 5 * pageRemainder;

        for (const score of displayedScores) {
            embed.addField(
                `**#${++i} ${score.username}${
                    score.mods.length > 0
                        ? ` (${score.getCompleteModString()})`
                        : ""
                }**`,
                await getScoreDescription(score)
            );
        }

        Object.assign(options, embedOptions);
    };

    MessageButtonCreator.createLimitlessButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        [],
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
