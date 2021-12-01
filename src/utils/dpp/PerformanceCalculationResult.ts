import {
    DroidPerformanceCalculator,
    MapInfo,
    OsuPerformanceCalculator,
    ReplayAnalyzer,
} from "osu-droid";

/**
 * Represents a beatmap's performance calculation result.
 */
export class PerformanceCalculationResult {
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
    readonly droid: DroidPerformanceCalculator;

    /**
     * The performance of the beatmap in osu!standard.
     */
    readonly osu: OsuPerformanceCalculator;

    constructor(
        map: MapInfo,
        droid: DroidPerformanceCalculator,
        osu: OsuPerformanceCalculator,
        replay?: ReplayAnalyzer
    ) {
        this.map = map;
        this.droid = droid;
        this.osu = osu;
        this.replay = replay;
    }
}
