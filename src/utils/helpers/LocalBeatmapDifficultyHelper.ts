import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { Beatmap, Modes } from "@rian8337/osu-base";
import {
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

/**
 * A helper for calculating beatmaps that are stored locally.
 */
export abstract class LocalBeatmapDifficultyHelper {
    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @param calculationParams The calculation parameters.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        mode: Modes.droid,
        method: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
    ): DroidDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @param calculationParams The calculation parameters.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        mode: Modes.osu,
        method: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
    ): OsuDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @param calculationParams The calculation parameters.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        mode: Modes.droid,
        method: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
    ): RebalanceDroidDifficultyCalculator;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param mode The gamemode to calculate.
     * @param method The calculation method to use.
     * @param calculationParams The calculation parameters.
     * @returns The calculator instance that calculated the beatmap.
     */
    static calculateDifficulty(
        beatmap: Beatmap,
        mode: Modes.osu,
        method: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
    ): RebalanceOsuDifficultyCalculator;

    static calculateDifficulty(
        beatmap: Beatmap,
        mode: Modes,
        method: PPCalculationMethod,
        calculationParams?: DifficultyCalculationParameters,
    ):
        | DroidDifficultyCalculator
        | OsuDifficultyCalculator
        | RebalanceDroidDifficultyCalculator
        | RebalanceOsuDifficultyCalculator {
        const calculationOptions =
            calculationParams?.toDroidDifficultyCalculationOptions();

        if (mode === Modes.droid) {
            switch (method) {
                case PPCalculationMethod.live:
                    return new DroidDifficultyCalculator(beatmap).calculate(
                        calculationOptions,
                    );
                case PPCalculationMethod.rebalance:
                    return new RebalanceDroidDifficultyCalculator(
                        beatmap,
                    ).calculate(calculationOptions);
            }
        } else {
            switch (method) {
                case PPCalculationMethod.rebalance:
                    return new RebalanceOsuDifficultyCalculator(
                        beatmap,
                    ).calculate(calculationOptions);
                default:
                    return new OsuDifficultyCalculator(beatmap).calculate(
                        calculationOptions,
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
        calculationParams: PerformanceCalculationParameters,
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
        calculationParams: PerformanceCalculationParameters,
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
        calculationParams: PerformanceCalculationParameters,
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
        calculationParams: PerformanceCalculationParameters,
    ): RebalanceOsuPerformanceCalculator;

    static calculatePerformance(
        calculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator
            | OsuDifficultyCalculator
            | RebalanceOsuDifficultyCalculator,
        calculationParams: PerformanceCalculationParameters,
    ):
        | DroidPerformanceCalculator
        | RebalanceDroidPerformanceCalculator
        | OsuPerformanceCalculator
        | RebalanceOsuPerformanceCalculator {
        calculationParams.applyFromAttributes(calculator.attributes);

        const calculationOptions: PerformanceCalculationOptions = {
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
        };

        if (calculator instanceof DroidDifficultyCalculator) {
            return new DroidPerformanceCalculator(
                calculator.attributes,
            ).calculate(calculationOptions);
        } else if (calculator instanceof OsuDifficultyCalculator) {
            return new OsuPerformanceCalculator(
                calculator.attributes,
            ).calculate(calculationOptions);
        } else if (calculator instanceof RebalanceDroidDifficultyCalculator) {
            return new RebalanceDroidPerformanceCalculator(
                calculator.attributes,
            ).calculate(calculationOptions);
        } else {
            return new RebalanceOsuPerformanceCalculator(
                calculator.attributes,
            ).calculate(calculationOptions);
        }
    }
}
