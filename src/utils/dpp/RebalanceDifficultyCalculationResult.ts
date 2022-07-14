import { MapInfo } from "@rian8337/osu-base";
import { DifficultyCalculator as RebalanceDifficultyCalculator } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class RebalanceDifficultyCalculationResult<
    T extends RebalanceDifficultyCalculator
> {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

    /**
     * The difficulty of the beatmap.
     */
    readonly result: T;

    constructor(map: MapInfo<true>, result: T) {
        this.map = map;
        this.result = result;
    }
}
