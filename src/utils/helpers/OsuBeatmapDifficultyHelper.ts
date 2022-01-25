import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { RebalanceStarRatingCalculationResult } from "@alice-utils/dpp/RebalanceStarRatingCalculationResult";
import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import { MapInfo, Accuracy } from "@rian8337/osu-base";
import {
    OsuPerformanceCalculator,
    OsuStarRating,
} from "@rian8337/osu-difficulty-calculator";
import {
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
    OsuStarRating as RebalanceOsuStarRating,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";

/**
 * A helper class for calculating osu!standard difficulty and performance of beatmaps or scores.
 */
export abstract class OsuBeatmapDifficultyHelper extends BeatmapDifficultyHelper {
    /**
     * Calculates the osu!standard difficulty and performance value of a score.
     *
     * @param score The score.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScorePerformance(
        score: Score,
        calcParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<OsuPerformanceCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??= await this.getCalculationParamsFromScore(score, false);

        const result: StarRatingCalculationResult<OsuStarRating> | null =
            await this.calculateDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        return this.calculatePerformance(result, calcParams);
    }

    /**
     * Calculates the osu!standard rebalance difficulty and performance value of a score.
     *
     * @param score The score.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScoreRebalancePerformance(
        score: Score,
        calcParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap?.map) {
            return null;
        }

        calcParams ??= await this.getCalculationParamsFromScore(score, false);

        const result: RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null =
            await this.calculateRebalanceDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        return this.calculateRebalancePerformance(result, calcParams);
    }

    /**
     * Calculates the osu!standard difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<OsuPerformanceCalculator> | null>;

    /**
     * Calculates the osu!standard difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        star: StarRatingCalculationResult<OsuStarRating>,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<OsuPerformanceCalculator> | null>;

    /**
     * Calculates the osu!standard difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<OsuPerformanceCalculator> | null>;

    static async calculateBeatmapPerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | StarRatingCalculationResult<OsuStarRating>,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<PerformanceCalculationResult<OsuPerformanceCalculator> | null> {
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

        const star: StarRatingCalculationResult<OsuStarRating> | null =
            beatmapOrHashOrStar instanceof StarRatingCalculationResult
                ? beatmapOrHashOrStar
                : await this.calculateDifficulty(beatmap, calculationParams);

        if (!star) {
            return null;
        }

        return this.calculatePerformance(star, calculationParams);
    }

    /**
     * Calculates the osu!standard rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapRebalancePerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null>;

    /**
     * Calculates the osu!standard rebalance difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceOsuStarRating>,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null>;

    /**
     * Calculates the osu!standard rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapRebalancePerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null>;

    static async calculateBeatmapRebalancePerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | RebalanceStarRatingCalculationResult<RebalanceOsuStarRating>,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null> {
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

        const star: RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null =
            beatmapOrHashOrStar instanceof RebalanceStarRatingCalculationResult
                ? beatmapOrHashOrStar
                : await this.calculateRebalanceDifficulty(
                      beatmap,
                      calculationParams
                  );

        if (!star) {
            return null;
        }

        return this.calculateRebalancePerformance(star, calculationParams);
    }

    /**
     * Calculates the osu!standard difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreDifficulty(
        score: Score
    ): Promise<StarRatingCalculationResult<OsuStarRating> | null> {
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
     * Calculates the osu!standard rebalance difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreRebalanceDifficulty(
        score: Score
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null> {
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
     * Calculates the osu!standard difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<OsuStarRating> | null>;

    /**
     * Calculates the osu!standard difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<OsuStarRating> | null>;

    static async calculateBeatmapDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<OsuStarRating> | null> {
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
     * Calculates the osu!standard rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null>;

    /**
     * Calculates the osu!standard rebalance difficulty of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapRebalanceDifficulty(
        beatmapIDorHash: number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null>;

    static async calculateBeatmapRebalanceDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null> {
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
     * Calculates the osu!standard difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static async calculateDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<StarRatingCalculationResult<OsuStarRating> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.objects.length === 0) {
            return null;
        }

        const star: OsuStarRating = new OsuStarRating().calculate({
            map: beatmap.map!,
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        return new StarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the osu!standard rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static async calculateRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: StarRatingCalculationParameters
    ): Promise<RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> | null> {
        await this.initBeatmap(beatmap);

        if (beatmap.map!.objects.length === 0) {
            return null;
        }

        const star: RebalanceOsuStarRating =
            new RebalanceOsuStarRating().calculate({
                map: beatmap.map!,
                mods: calculationParams.customStatistics?.mods,
                stats: calculationParams.customStatistics,
            });

        return new RebalanceStarRatingCalculationResult(beatmap, star);
    }

    /**
     * Calculates the osu!standard performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculatePerformance(
        star: StarRatingCalculationResult<OsuStarRating>,
        calculationParams: PerformanceCalculationParameters
    ): PerformanceCalculationResult<OsuPerformanceCalculator> | null {
        if (star.result.map.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        const pp: OsuPerformanceCalculator =
            new OsuPerformanceCalculator().calculate({
                stars: star.result,
                combo: calculationParams.combo,
                accPercent: calculationParams.accuracy,
                stats: calculationParams.customStatistics,
            });

        return new PerformanceCalculationResult(star.map, pp);
    }

    /**
     * Calculates the osu!standard performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculateRebalancePerformance(
        star: RebalanceStarRatingCalculationResult<RebalanceOsuStarRating>,
        calculationParams: PerformanceCalculationParameters
    ): RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator> | null {
        if (star.result.map.objects.length === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        const pp: RebalanceOsuPerformanceCalculator =
            new RebalanceOsuPerformanceCalculator().calculate({
                stars: star.result,
                combo: calculationParams.combo,
                accPercent: calculationParams.accuracy,
                stats: calculationParams.customStatistics,
            });

        return new RebalancePerformanceCalculationResult(star.map, pp);
    }
}
