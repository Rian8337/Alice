import { MapInfo } from "@rian8337/osu-base";
import {
    DifficultyCalculator,
    PerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { PerformanceCalculationParameters } from "./PerformanceCalculationParameters";

/**
 * Represents a beatmap's performance calculation result.
 */
export class PerformanceCalculationResult<
    D extends DifficultyCalculator,
    P extends PerformanceCalculator
> {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

    /**
     * The difficulty of the beatmap.
     */
    readonly difficultyCalculator: D;

    /**
     * The calculation parameters.
     */
    readonly params: PerformanceCalculationParameters;

    /**
     * The performance of the beatmap.
     */
    readonly result: P;

    constructor(
        map: MapInfo<true>,
        params: PerformanceCalculationParameters,
        difficultyCalculator: D,
        result: P
    ) {
        this.map = map;
        this.params = params;
        this.difficultyCalculator = difficultyCalculator;
        this.result = result;
    }
}
