import {
    MapInfo,
    ReplayAnalyzer,
    RebalancePerformanceCalculator,
} from "osu-droid";

/**
 * Represents a beatmap's performance calculation result.
 */
export class RebalancePerformanceCalculationResult<T extends RebalancePerformanceCalculator> {
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
    readonly result: T;

    constructor(
        map: MapInfo,
        result: T,
        replay?: ReplayAnalyzer
    ) {
        this.map = map;
        this.result = result;
        this.replay = replay;
    }
}
