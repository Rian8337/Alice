import {
    Accuracy,
    Beatmap,
    MapInfo,
    MapStats,
    Mod,
    ModNightCore,
    ModUtil,
} from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import {
    DifficultyCalculator,
    PerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DifficultyCalculator as RebalanceDifficultyCalculator,
    DroidDifficultyCalculator,
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    PerformanceCalculator as RebalancePerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { RebalanceDifficultyCalculationResult } from "@alice-utils/dpp/RebalanceDifficultyCalculationResult";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { DifficultyCalculationResult } from "@alice-utils/dpp/DifficultyCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    ThreeFingerChecker,
    ReplayAnalyzer,
} from "@rian8337/osu-droid-replay-analyzer";

/**
 * A helper class for calculating difficulty and performance of beatmaps or scores.
 */
export abstract class BeatmapDifficultyHelper<
    DC extends DifficultyCalculator,
    PC extends PerformanceCalculator<DC>,
    RDC extends RebalanceDifficultyCalculator,
    RPC extends RebalancePerformanceCalculator<RDC>
> {
    /**
     * The difficulty calculator to use.
     */
    protected abstract readonly difficultyCalculator: new (
        beatmap: Beatmap
    ) => DC;

    /**
     * The rebalance difficulty calculator to use.
     */
    protected abstract readonly rebalanceDifficultyCalculator: new (
        beatmap: Beatmap
    ) => RDC;

    /**
     * The performance calculator to use.
     */
    protected abstract readonly performanceCalculator: new (
        difficultyCalculator: DC
    ) => PC;

    /**
     * The rebalance performance calculator to use.
     */
    protected abstract readonly rebalancePerformanceCalculator: new (
        difficultyCalculator: RDC
    ) => RPC;

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
    ): Promise<PerformanceCalculationResult<DC, PC> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
            return null;
        }

        calcParams ??=
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                useReplay
            );

        const result: DifficultyCalculationResult<DC> | null =
            await this.calculateDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf or not.
        if (
            result.result instanceof DroidDifficultyCalculator &&
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
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
            return null;
        }

        calcParams ??=
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                score,
                useReplay
            );

        const result: RebalanceDifficultyCalculationResult<RDC> | null =
            await this.calculateRebalanceDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf and 2h detection or not.
        if (
            result.result instanceof RebalanceDroidDifficultyCalculator &&
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
    ): Promise<PerformanceCalculationResult<DC, PC> | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        star: DifficultyCalculationResult<DC>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DC, PC> | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        beatmapIdOrHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DC, PC> | null>;

    async calculateBeatmapPerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | DifficultyCalculationResult<DC>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DC, PC> | null> {
        let beatmap: MapInfo<true> | null;

        if (beatmapOrHashOrStar instanceof MapInfo) {
            beatmap = beatmapOrHashOrStar;
        } else if (beatmapOrHashOrStar instanceof DifficultyCalculationResult) {
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

        const star: DifficultyCalculationResult<DC> | null =
            beatmapOrHashOrStar instanceof DifficultyCalculationResult
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
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null>;

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        star: RebalanceDifficultyCalculationResult<RDC>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null>;

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
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null>;

    async calculateBeatmapRebalancePerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | RebalanceDifficultyCalculationResult<RDC>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null> {
        let beatmap: MapInfo<true> | null;

        if (beatmapOrHashOrStar instanceof MapInfo) {
            beatmap = beatmapOrHashOrStar;
        } else if (
            beatmapOrHashOrStar instanceof RebalanceDifficultyCalculationResult
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

        const star: RebalanceDifficultyCalculationResult<RDC> | null =
            beatmapOrHashOrStar instanceof RebalanceDifficultyCalculationResult
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
    ): Promise<DifficultyCalculationResult<DC> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
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
    ): Promise<RebalanceDifficultyCalculationResult<RebalanceDifficultyCalculator> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
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
        calculationParams: DifficultyCalculationParameters
    ): Promise<DifficultyCalculationResult<DC> | null>;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapDifficulty(
        beatmapIdOrHash: number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<DifficultyCalculationResult<DC> | null>;

    async calculateBeatmapDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<DifficultyCalculationResult<DC> | null> {
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
        calculationParams: DifficultyCalculationParameters
    ): Promise<RebalanceDifficultyCalculationResult<RDC> | null>;

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmapIdorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapRebalanceDifficulty(
        beatmapIdorHash: number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<RebalanceDifficultyCalculationResult<RDC> | null>;

    async calculateBeatmapRebalanceDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<RebalanceDifficultyCalculationResult<RDC> | null> {
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
        calculationParams: DifficultyCalculationParameters
    ): Promise<DifficultyCalculationResult<DC> | null> {
        await this.initBeatmap(beatmap);

        if (
            !beatmap.hasDownloadedBeatmap() ||
            beatmap.beatmap.hitObjects.objects.length === 0
        ) {
            return null;
        }

        const star: DC = new this.difficultyCalculator(
            beatmap.beatmap
        ).calculate({
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        return new DifficultyCalculationResult(beatmap, star);
    }

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private async calculateRebalanceDifficulty(
        beatmap: MapInfo<true>,
        calculationParams: DifficultyCalculationParameters
    ): Promise<RebalanceDifficultyCalculationResult<RDC> | null> {
        await this.initBeatmap(beatmap);

        if (
            !beatmap.hasDownloadedBeatmap() ||
            beatmap.beatmap.hitObjects.objects.length === 0
        ) {
            return null;
        }

        const star: RDC = new this.rebalanceDifficultyCalculator(
            beatmap.beatmap
        ).calculate({
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        return new RebalanceDifficultyCalculationResult(beatmap, star);
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
        star: DifficultyCalculationResult<DC>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): PerformanceCalculationResult<DC, PC> | null {
        if (star.result.beatmap.hitObjects.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (replay && star.result instanceof DroidDifficultyCalculator) {
            replay.beatmap = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }
        }

        const pp: PC = new this.performanceCalculator(star.result).calculate({
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
        star: RebalanceDifficultyCalculationResult<RDC>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): RebalancePerformanceCalculationResult<RDC, RPC> | null {
        if (star.result.beatmap.hitObjects.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (
            replay &&
            star.result instanceof RebalanceDroidDifficultyCalculator
        ) {
            replay.beatmap = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }

            // if (!replay.hasBeenCheckedFor2Hand) {
            //     replay.checkFor2Hand();
            // }
        }

        const pp: RPC = new this.rebalancePerformanceCalculator(
            star.result
        ).calculate({
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
