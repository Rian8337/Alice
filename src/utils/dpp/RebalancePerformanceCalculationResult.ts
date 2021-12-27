import {
    RebalanceDroidPerformanceCalculator,
    MapInfo,
    RebalanceOsuPerformanceCalculator,
    ReplayAnalyzer,
} from "osu-droid";

/**
 * Represents a beatmap's performance calculation result.
 */
export class RebalancePerformanceCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo;

    /**
     * The replay of the score, if one is used during calculation.
     */
    readonly replay?: ReplayAnalyzer;

    /**
     * The performance of the beatmap in osu!droid.
     */
    readonly droid: RebalanceDroidPerformanceCalculator;

    /**
     * The performance of the beatmap in osu!standard.
     */
    readonly osu: RebalanceOsuPerformanceCalculator;

    constructor(
        map: MapInfo,
        droid: RebalanceDroidPerformanceCalculator,
        osu: RebalanceOsuPerformanceCalculator,
        replay?: ReplayAnalyzer
    ) {
        this.map = map;
        this.droid = droid;
        this.osu = osu;
        this.replay = replay;
    }
}
