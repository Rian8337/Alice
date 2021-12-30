import {
    Accuracy,
    DroidPerformanceCalculator,
    DroidStarRating,
    MapInfo,
    RebalanceDroidPerformanceCalculator,
    RebalanceDroidStarRating,
    ReplayAnalyzer,
    Score,
    ThreeFingerChecker,
} from "osu-droid";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { RebalanceStarRatingCalculationResult } from "@alice-utils/dpp/RebalanceStarRatingCalculationResult";
import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";

/**
 * A helper class for calculating osu!droid difficulty and performance of beatmaps or scores.
 */
export abstract class DroidBeatmapDifficultyHelper extends BeatmapDifficultyHelper {
    /**
     * Calculates the osu!droid difficulty and performance value of a score.
     *
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation when needed. Defaults to `true`.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScorePerformance(
        score: Score,
        useReplay: boolean = true,
        calcParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<DroidPerformanceCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??= await this.getCalculationParamsFromScore(
            score,
            useReplay
        );

        const result: StarRatingCalculationResult<DroidStarRating> | null =
            await this.calculateDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf or not.
        if (
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
     * Calculates the osu!droid rebalance difficulty and performance value of a score.
     *
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation when needed. Defaults to `true`.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScoreRebalancePerformance(
        score: Score,
        useReplay: boolean = true,
        calcParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??= await this.getCalculationParamsFromScore(
            score,
            useReplay
        );

        const result: RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> | null =
            await this.calculateRebalanceDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        // Determine whether to use replay for 3f nerf or not.
        if (
            !score.replay &&
            useReplay &&
            ThreeFingerChecker.isEligibleToDetect(result.result)
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
     * Calculates the osu!droid difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        star: StarRatingCalculationResult<DroidStarRating>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DroidPerformanceCalculator> | null>;

    /**
     * Calculates the osu!droid difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DroidPerformanceCalculator> | null>;

    static async calculateBeatmapPerformance(
        beatmapIDorHashorStar:
            | number
            | string
            | StarRatingCalculationResult<DroidStarRating>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<PerformanceCalculationResult<DroidPerformanceCalculator> | null> {
        const beatmap: MapInfo | null =
            beatmapIDorHashorStar instanceof StarRatingCalculationResult
                ? beatmapIDorHashorStar.map
                : await BeatmapManager.getBeatmap(beatmapIDorHashorStar);

        if (!beatmap?.map) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo
        );

        const star: StarRatingCalculationResult<DroidStarRating> | null =
            beatmapIDorHashorStar instanceof StarRatingCalculationResult
                ? beatmapIDorHashorStar
                : await this.calculateDifficulty(beatmap, calculationParams);

        if (!star) {
            return null;
        }

        return this.calculatePerformance(star, calculationParams, replay);
    }

    /**
     * Calculates the osu!droid rebalance difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceDroidStarRating>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null>;

    /**
     * Calculates the osu!droid rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapRebalancePerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null>;

    static async calculateBeatmapRebalancePerformance(
        beatmapIDorHashorStar:
            | number
            | string
            | RebalanceStarRatingCalculationResult<RebalanceDroidStarRating>,
        calculationParams?: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): Promise<RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null> {
        const beatmap: MapInfo | null =
            beatmapIDorHashorStar instanceof
            RebalanceStarRatingCalculationResult
                ? beatmapIDorHashorStar.map
                : await BeatmapManager.getBeatmap(beatmapIDorHashorStar);

        if (!beatmap?.map) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo
        );

        const star: RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> | null =
            beatmapIDorHashorStar instanceof
            RebalanceStarRatingCalculationResult
                ? beatmapIDorHashorStar
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
     * Calculates the osu!droid difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreDifficulty(
        score: Score
    ): Promise<StarRatingCalculationResult<DroidStarRating> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateDifficulty(
            beatmap,
            await this.getCalculationParamsFromScore(score, false)
        );
    }

    /**
     * Calculates the osu!droid rebalance difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreRebalanceDifficulty(
        score: Score
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateRebalanceDifficulty(
            beatmap,
            await this.getCalculationParamsFromScore(score, false)
        );
    }

    /**
     * Calculates the osu!droid difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DroidStarRating> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            beatmapIDorHash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the osu!droid rebalance difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapRebalanceDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            beatmapIDorHash
        );

        if (!beatmap?.map) {
            return null;
        }

        return this.calculateRebalanceDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the osu!droid difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static async calculateDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<DroidStarRating> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.objects.length === 0) {
            return null;
        }

        const star: DroidStarRating = new DroidStarRating().calculate({
            map: beatmap.map!,
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        return new StarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the osu!droid rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static async calculateRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.objects.length === 0) {
            return null;
        }

        const star: RebalanceDroidStarRating =
            new RebalanceDroidStarRating().calculate({
                map: beatmap.map!,
                mods: calculationParams.customStatistics?.mods,
                stats: calculationParams.customStatistics,
            });

        return new RebalanceStarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the osu!droid performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @param replay The replay of the score in the beatmap, if available. This will be used to analyze if the score uses 3 finger abuse.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculatePerformance(
        star: StarRatingCalculationResult<DroidStarRating>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): PerformanceCalculationResult<DroidPerformanceCalculator> | null {
        if (star.result.map.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (replay) {
            replay.map = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }
        }

        const pp: DroidPerformanceCalculator =
            new DroidPerformanceCalculator().calculate({
                stars: star.result,
                combo: calculationParams.combo,
                accPercent: calculationParams.accuracy,
                tapPenalty: calculationParams.tapPenalty,
                stats: calculationParams.customStatistics,
            });

        return new PerformanceCalculationResult(star.map, pp, replay);
    }

    /**
     * Calculates the osu!droid performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @param replay The replay of the score in the beatmap, if available. This will be used to analyze if the score uses 3 finger abuse.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculateRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceDroidStarRating>,
        calculationParams: PerformanceCalculationParameters,
        replay?: ReplayAnalyzer
    ): RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null {
        if (star.result.map.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        if (replay) {
            replay.map = star.result;

            if (!replay.hasBeenCheckedFor3Finger) {
                replay.checkFor3Finger();
                calculationParams.tapPenalty = replay.tapPenalty;
            }
        }

        const pp: RebalanceDroidPerformanceCalculator =
            new RebalanceDroidPerformanceCalculator().calculate({
                stars: star.result,
                combo: calculationParams.combo,
                accPercent: calculationParams.accuracy,
                tapPenalty: calculationParams.tapPenalty,
                stats: calculationParams.customStatistics,
            });

        return new RebalancePerformanceCalculationResult(star.map, pp, replay);
    }
}
