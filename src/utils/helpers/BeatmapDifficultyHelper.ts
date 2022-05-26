import {
    Accuracy,
    MapInfo,
    MapStats,
    Mod,
    modes,
    ModNightCore,
    ModUtil,
} from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import {
    DroidStarRating,
    PerformanceCalculator,
    StarRating,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidStarRating as RebalanceDroidStarRating,
    PerformanceCalculator as RebalancePerformanceCalculator,
    StarRating as RebalanceStarRating,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { RebalanceStarRatingCalculationResult } from "@alice-utils/dpp/RebalanceStarRatingCalculationResult";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    ThreeFingerChecker,
    ReplayAnalyzer,
} from "@rian8337/osu-droid-replay-analyzer";

/**
 * A helper class for calculating difficulty and performance of beatmaps or scores.
 */
export abstract class BeatmapDifficultyHelper<
    DifficultyCalculator extends StarRating,
    RebalanceDifficultyCalculator extends RebalanceStarRating,
    PPCalculator extends PerformanceCalculator,
    RebalancePPCalculator extends RebalancePerformanceCalculator
> {
    /**
     * The difficulty calculator to use.
     */
    protected abstract readonly difficultyCalculator: new () => DifficultyCalculator;

    /**
     * The rebalance difficulty calculator to use.
     */
    protected abstract readonly rebalanceDifficultyCalculator: new () => RebalanceDifficultyCalculator;

    /**
     * The performance calculator to use.
     */
    protected abstract readonly performanceCalculator: new () => PPCalculator;

    /**
     * The rebalance performance calculator to use.
     */
    protected abstract readonly rebalancePerformanceCalculator: new () => RebalancePPCalculator;

    /**
     * The gamemode this helper is calculating for.
     */
    protected abstract readonly mode: modes;

    /**
     * Gets calculation parameters from a user's message.
     *
     * @param message The user's message.
     * @returns The calculation parameters from the user's message.
     */
    static getCalculationParamsFromMessage(
        message: string
    ): PerformanceCalculationParameters {
        const mods: Mod[] = [];
        let combo: number | undefined;
        let forceAR: number | undefined;
        let speedMultiplier: number = 1;
        let accPercent: number = 100;
        let countMiss: number = 0;
        let count100: number = 0;
        let count50: number = 0;

        for (const input of message.split(/\s+/g)) {
            if (input.endsWith("%")) {
                const newAccPercent = parseFloat(input);
                accPercent = Math.max(0, Math.min(newAccPercent || 0, 100));
            }
            if (input.endsWith("m")) {
                const newCountMiss = parseInt(input);
                countMiss = Math.max(0, newCountMiss || 0);
            }
            if (input.endsWith("x")) {
                if (input.includes(".")) {
                    speedMultiplier = Math.max(
                        0.5,
                        Math.min(
                            2,
                            parseFloat(parseFloat(input).toFixed(2)) || 1
                        )
                    );
                } else {
                    const newCombo = parseInt(input);
                    combo = Math.max(0, newCombo || 0);
                }
            }
            if (input.startsWith("+")) {
                mods.push(...ModUtil.pcStringToMods(input.replace("+", "")));
            }
            if (input.startsWith("AR")) {
                forceAR = Math.max(
                    0,
                    Math.min(
                        12.5,
                        parseFloat(parseFloat(input.substring(2)).toFixed(2)) ||
                            0
                    )
                );
            }
            if (input.endsWith("x50")) {
                count50 = Math.max(0, parseInt(input) || 0);
            }
            if (input.endsWith("x100")) {
                count100 = Math.max(0, parseInt(input) || 0);
            }
        }

        const stats: MapStats = new MapStats({
            mods: mods,
            ar: forceAR,
            speedMultiplier: speedMultiplier,
            isForceAR: !isNaN(<number>forceAR),
        });

        return new PerformanceCalculationParameters(
            new Accuracy({
                n100: count100,
                n50: count50,
                nmiss: countMiss,
            }),
            accPercent,
            combo,
            1,
            stats
        );
    }

    /**
     * Gets calculation parameters from a score.
     *
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation when needed. Defaults to `true`.
     * @returns Calculation parameters of the score.
     */
    static async getCalculationParamsFromScore(
        score: Score,
        useReplay: boolean = true
    ): Promise<PerformanceCalculationParameters> {
        if (
            !score.replay &&
            useReplay &&
            score.mods.some((m) => m instanceof ModNightCore)
        ) {
            await score.downloadReplay();
        }

        const stats: MapStats = new MapStats({
            mods: score.mods,
            ar: score.forcedAR,
            speedMultiplier: score.speedMultiplier,
            isForceAR: !isNaN(score.forcedAR!),
            oldStatistics: (score.replay?.data?.replayVersion ?? 4) <= 3,
        });

        return new PerformanceCalculationParameters(
            score.accuracy,
            score.accuracy.value() * 100,
            score.combo,
            1,
            stats
        );
    }

    /**
     * Calculates the difficulty and performance value of a score.
     *
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation when needed. Defaults to `true`.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateScorePerformance(
        score: Score,
        useReplay: boolean = true,
        calcParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<PPCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??=
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                useReplay
            );

        const result: StarRatingCalculationResult<DifficultyCalculator> | null =
            await this.calculateDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf or not.
        if (
            result.result instanceof DroidStarRating &&
            !score.replay &&
            useReplay &&
            ThreeFingerChecker.isEligibleToDetect(result.result)
        ) {
            await score.downloadReplay();
        }

        return this.calculatePerformance(
            result,
            calcParams,
            useReplay ? score.replay : undefined
        );
    }

    /**
     * Calculates the rebalance difficulty and performance value of a score.
     *
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation when needed. Defaults to `true`.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateScoreRebalancePerformance(
        score: Score,
        useReplay: boolean = true,
        calcParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalancePPCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??=
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                useReplay
            );

        const result: RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null =
            await this.calculateRebalanceDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf and 2h detection or not.
        if (
            result.result instanceof RebalanceDroidStarRating &&
            !score.replay &&
            useReplay
        ) {
            await score.downloadReplay();
        }

        return this.calculateRebalancePerformance(
            result,
            calcParams,
            useReplay ? score.replay : undefined
        );
    }

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<PPCalculator> | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        star: StarRatingCalculationResult<DifficultyCalculator>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<PPCalculator> | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<PPCalculator> | null>;

    async calculateBeatmapPerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | StarRatingCalculationResult<DifficultyCalculator>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<PPCalculator> | null> {
        let beatmap: MapInfo | null;

        if (beatmapOrHashOrStar instanceof MapInfo) {
            beatmap = beatmapOrHashOrStar;
        } else if (beatmapOrHashOrStar instanceof StarRatingCalculationResult) {
            beatmap = beatmapOrHashOrStar.map;
        } else {
            beatmap = await BeatmapManager.getBeatmap(beatmapOrHashOrStar);
        }

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo
        );

        const star: StarRatingCalculationResult<DifficultyCalculator> | null =
            beatmapOrHashOrStar instanceof StarRatingCalculationResult
                ? beatmapOrHashOrStar
                : await this.calculateDifficulty(beatmap, calculationParams);

        if (!star) {
            return null;
        }

        return this.calculatePerformance(star, calculationParams, replay);
    }

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalancePPCalculator> | null>;

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalancePPCalculator> | null>;

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalancePPCalculator> | null>;

    async calculateBeatmapRebalancePerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalancePPCalculator> | null> {
        let beatmap: MapInfo | null;

        if (beatmapOrHashOrStar instanceof MapInfo) {
            beatmap = beatmapOrHashOrStar;
        } else if (
            beatmapOrHashOrStar instanceof RebalanceStarRatingCalculationResult
        ) {
            beatmap = beatmapOrHashOrStar.map;
        } else {
            beatmap = await BeatmapManager.getBeatmap(beatmapOrHashOrStar);
        }

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo
        );

        const star: RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null =
            beatmapOrHashOrStar instanceof RebalanceStarRatingCalculationResult
                ? beatmapOrHashOrStar
                : await this.calculateRebalanceDifficulty(
                      beatmap,
                      calculationParams
                  );

        if (!star) {
            return null;
        }

        return this.calculateRebalancePerformance(
            star,
            calculationParams,
            replay
        );
    }

    /**
     * Calculates the difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    async calculateScoreDifficulty(
        score: Score
    ): Promise<StarRatingCalculationResult<DifficultyCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateDifficulty(
            beatmap,
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                false
            )
        );
    }

    /**
     * Calculates the rebalance difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    async calculateScoreRebalanceDifficulty(
        score: Score
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateRebalanceDifficulty(
            beatmap,
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                false
            )
        );
    }

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DifficultyCalculator> | null>;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DifficultyCalculator> | null>;

    async calculateBeatmapDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DifficultyCalculator> | null> {
        const beatmap: MapInfo | null =
            beatmapOrIdOrHash instanceof MapInfo
                ? beatmapOrIdOrHash
                : await BeatmapManager.getBeatmap(beatmapOrIdOrHash);

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null>;

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapRebalanceDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null>;

    async calculateBeatmapRebalanceDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null> {
        const beatmap: MapInfo | null =
            beatmapOrIdOrHash instanceof MapInfo
                ? beatmapOrIdOrHash
                : await BeatmapManager.getBeatmap(beatmapOrIdOrHash);

        if (!beatmap) {
            return null;
        }

        return this.calculateRebalanceDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private async calculateDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DifficultyCalculator> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.hitObjects.objects.length === 0) {
            return null;
        }

        const star: DifficultyCalculator =
            new this.difficultyCalculator().calculate(
                {
                    map: beatmap.map!,
                    mods: calculationParams.customStatistics?.mods,
                    stats: calculationParams.customStatistics,
                },
                this.mode
            );

        return new StarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private async calculateRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.hitObjects.objects.length === 0) {
            return null;
        }

        const star: RebalanceDifficultyCalculator =
            new this.rebalanceDifficultyCalculator().calculate(
                {
                    map: beatmap.map!,
                    mods: calculationParams.customStatistics?.mods,
                    stats: calculationParams.customStatistics,
                },
                this.mode
            );

        return new RebalanceStarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @param replay The replay of the score in the beatmap, if available. This will be used to analyze if the score uses 3 finger abuse.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private calculatePerformance(
        star: StarRatingCalculationResult<DifficultyCalculator>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): PerformanceCalculationResult<PPCalculator> | null {
        if (star.result.map.hitObjects.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (
            replay &&
            (star.result instanceof DroidStarRating ||
                star.result instanceof RebalanceDroidStarRating)
        ) {
            replay.map = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }

            if (
                !replay.hasBeenCheckedFor2Hand &&
                star.result instanceof RebalanceDroidStarRating
            ) {
                replay.checkFor2Hand();
            }
        }

        const pp: PPCalculator = new this.performanceCalculator().calculate({
            stars: star.result,
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
            stats: calculationParams.customStatistics,
        });

        return new PerformanceCalculationResult(star.map, pp, replay);
    }

    /**
     * Calculates the performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @param replay The replay of the score in the beatmap, if available. This will be used to analyze if the score uses 3 finger abuse.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private calculateRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceDifficultyCalculator>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): RebalancePerformanceCalculationResult<RebalancePPCalculator> | null {
        if (star.result.map.hitObjects.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (replay && star.result instanceof RebalanceDroidStarRating) {
            replay.map = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }
        }

        const pp: RebalancePPCalculator =
            new this.rebalancePerformanceCalculator().calculate({
                stars: star.result,
                combo: calculationParams.combo,
                accPercent: calculationParams.accuracy,
                tapPenalty: calculationParams.tapPenalty,
                stats: calculationParams.customStatistics,
            });

        return new RebalancePerformanceCalculationResult(star.map, pp, replay);
    }

    /**
     * Initializes a beatmap by downloading its file when needed.
     *
     * @param beatmap The beatmap.
     */
    private async initBeatmap(beatmap: MapInfo): Promise<void> {
        await beatmap.retrieveBeatmapFile();
    }
}
