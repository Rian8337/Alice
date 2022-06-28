import { MapInfo } from "@rian8337/osu-base";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import {
    DifficultyCalculator as RebalanceDifficultyCalculator,
    PerformanceCalculator as RebalancePerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";

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
    readonly map: MapInfo;

    /**
     * The replay of the score, if one is used during calculation.
     */
    readonly replay?: ReplayAnalyzer;

    /**
     * The performance of the beatmap.
     */
    readonly result: P;

    constructor(map: MapInfo, result: P, replay?: ReplayAnalyzer) {
        this.map = map;
        this.result = result;
        this.replay = replay;
    }
}
