import { MapInfo } from "@rian8337/osu-base";
import {
    DifficultyCalculator as RebalanceDifficultyCalculator,
    PerformanceCalculator as RebalancePerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationParameters } from "./PerformanceCalculationParameters";

/**
 * Represents a beatmap's performance calculation result.
 */
export class RebalancePerformanceCalculationResult<
    D extends RebalanceDifficultyCalculator,
    P extends RebalancePerformanceCalculator<D>
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
