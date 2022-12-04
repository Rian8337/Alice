import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { Beatmap, MapStats, Modes, ModTouchDevice } from "@rian8337/osu-base";
import {
    DifficultyCalculationOptions,
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
    PerformanceCalculationOptions,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    OsuDifficultyCalculator as RebalanceOsuDifficultyCalculator,
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import {
    beatmap as OldBeatmap,
    diff,
    modbits,
    ppv2,
    std_diff,
    std_ppv2,
} from "ojsamadroid";
import { BeatmapOldDifficultyHelper } from "./BeatmapOldDifficultyHelper";

/**
 * A helper for calculating beatmaps that are stored locally.
 */
export abstract class LocalBeatmapDifficultyHelper {
    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams The calculation parameters.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes.droid,
        method: PPCalculationMethod.live
    ): DroidDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams The calculation parameters.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes.osu,
        method: PPCalculationMethod.live
    ): OsuDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams The calculation parameters.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes.droid,
        method: PPCalculationMethod.rebalance
    ): RebalanceDroidDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams The calculation parameters.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes.osu,
        method: PPCalculationMethod.rebalance
    ): RebalanceOsuDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams The calculation parameters.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes.droid,
        method: PPCalculationMethod.old
    ): std_diff;

    static calculateDifficulty(
        beatmap: Beatmap,
        calculationParams: DifficultyCalculationParameters,
        mode: Modes,
        method: PPCalculationMethod
    ):
        | DroidDifficultyCalculator
        | OsuDifficultyCalculator
        | std_diff
        | RebalanceDroidDifficultyCalculator
        | RebalanceOsuDifficultyCalculator {
        const calculationOptions: DifficultyCalculationOptions = {
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        };

        if (mode === Modes.droid) {
            switch (method) {
                case PPCalculationMethod.live:
                    return new DroidDifficultyCalculator(beatmap).calculate(
                        calculationOptions
                    );
                case PPCalculationMethod.rebalance:
                    return new RebalanceDroidDifficultyCalculator(
                        beatmap
                    ).calculate(calculationOptions);
                case PPCalculationMethod.old: {
                    const oldBeatmap: OldBeatmap =
                        BeatmapOldDifficultyHelper.convertBeatmap(beatmap);

                    // Calculate stats manually as ojsama has been modified to not do so by itself.
                    const stats: MapStats = new MapStats({
                        ...calculationParams.customStatistics,
                        cs: oldBeatmap.cs,
                        ar: calculationParams.customStatistics?.isForceAR
                            ? calculationParams.customStatistics?.ar
                            : oldBeatmap.ar,
                        od: oldBeatmap.od,
                        hp: oldBeatmap.hp,
                    }).calculate({ mode: Modes.droid });

                    oldBeatmap.cs = stats.cs!;
                    oldBeatmap.ar = stats.ar!;
                    oldBeatmap.od = stats.od!;
                    oldBeatmap.hp = stats.hp!;

                    return new diff().calc({
                        map: oldBeatmap,
                        mods: modbits.from_string(new ModTouchDevice().acronym),
                        speed_mul: stats.speedMultiplier,
                    });
                }
            }
        } else {
            switch (method) {
                case PPCalculationMethod.rebalance:
                    return new RebalanceOsuDifficultyCalculator(
                        beatmap
                    ).calculate(calculationOptions);
                default:
                    return new OsuDifficultyCalculator(beatmap).calculate(
                        calculationOptions
                    );
            }
        }
    }

    /**
     * Calculates the performance of a beatmap.
     *
     * @param calculator The difficulty calculator that calculates the beatmap.
     * @param calculationParams The calculation parameters.
     * @returns The performance calculator instance.
     */
    static calculatePerformance(
        calculator: DroidDifficultyCalculator,
        calculationParams: PerformanceCalculationParameters
    ): DroidPerformanceCalculator;

    /**
     * Calculates the performance of a beatmap.
     *
     * @param calculator The difficulty calculator that calculates the beatmap.
     * @param calculationParams The calculation parameters.
     * @returns The performance calculator instance.
     */
    static calculatePerformance(
        calculator: RebalanceDroidDifficultyCalculator,
        calculationParams: PerformanceCalculationParameters
    ): RebalanceDroidPerformanceCalculator;

    /**
     * Calculates the performance of a beatmap.
     *
     * @param calculator The difficulty calculator that calculates the beatmap.
     * @param calculationParams The calculation parameters.
     * @returns The performance calculator instance.
     */
    static calculatePerformance(
        calculator: OsuDifficultyCalculator,
        calculationParams: PerformanceCalculationParameters
    ): OsuPerformanceCalculator;

    /**
     * Calculates the performance of a beatmap.
     *
     * @param calculator The difficulty calculator that calculates the beatmap.
     * @param calculationParams The calculation parameters.
     * @returns The performance calculator instance.
     */
    static calculatePerformance(
        calculator: RebalanceOsuDifficultyCalculator,
        calculationParams: PerformanceCalculationParameters
    ): RebalanceOsuPerformanceCalculator;

    /**
     * Calculates the performance of a beatmap.
     *
     * @param calculator The difficulty calculator that calculates the beatmap.
     * @param calculationParams The calculation parameters.
     * @returns The performance calculator instance.
     */
    static calculatePerformance(
        calculator: std_diff,
        calculationParams: PerformanceCalculationParameters
    ): std_ppv2;

    static calculatePerformance(
        calculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator
            | OsuDifficultyCalculator
            | RebalanceOsuDifficultyCalculator
            | std_diff,
        calculationParams: PerformanceCalculationParameters
    ):
        | DroidPerformanceCalculator
        | RebalanceDroidPerformanceCalculator
        | OsuPerformanceCalculator
        | RebalanceOsuPerformanceCalculator
        | std_ppv2 {
        if (!(calculator instanceof std_diff)) {
            calculationParams.applyFromAttributes(calculator.attributes);
        }

        const calculationOptions: PerformanceCalculationOptions = {
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
        };

        if (calculator instanceof DroidDifficultyCalculator) {
            return new DroidPerformanceCalculator(
                calculator.attributes
            ).calculate(calculationOptions);
        } else if (calculator instanceof OsuDifficultyCalculator) {
            return new OsuPerformanceCalculator(
                calculator.attributes
            ).calculate(calculationOptions);
        } else if (calculator instanceof RebalanceDroidDifficultyCalculator) {
            return new RebalanceDroidPerformanceCalculator(
                calculator.attributes
            ).calculate(calculationOptions);
        } else if (calculator instanceof RebalanceOsuDifficultyCalculator) {
            return new RebalanceOsuPerformanceCalculator(
                calculator.attributes
            ).calculate(calculationOptions);
        } else {
            return ppv2({
                stars: calculator,
                combo: calculationParams.combo,
                n300: calculationParams.accuracy.n300,
                n100: calculationParams.accuracy.n100,
                n50: calculationParams.accuracy.n50,
                nmiss: calculationParams.accuracy.nmiss,
            });
        }
    }
}
