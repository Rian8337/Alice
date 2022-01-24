import { MapInfo } from "@rian8337/osu-base";
import { PerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

/**
 * Represents a beatmap's performance calculation result.
 */
export class PerformanceCalculationResult<T extends PerformanceCalculator> {
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

    constructor(map: MapInfo, result: T, replay?: ReplayAnalyzer) {
        this.map = map;
        this.result = result;
        this.replay = replay;
    }
}
