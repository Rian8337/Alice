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
    P extends PerformanceCalculator<D>
> {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

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
        result: P
    ) {
        this.map = map;
        this.params = params;
        this.result = result;
    }
}
