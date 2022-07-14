import { MapInfo } from "@rian8337/osu-base";
import { std_diff, std_ppv2 } from "ojsamadroid";

/**
 * Represents a beatmap's old performance calculation result.
 */
export class OldPerformanceCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

    /**
     * The difficulty calculator that calculated the beatmap.
     */
    readonly difficultyCalculationResult: std_diff;

    /**
     * The performance of the beatmap.
     */
    readonly result: std_ppv2;

    constructor(
        map: MapInfo<true>,
        difficultyCalculationResult: std_diff,
        result: std_ppv2
    ) {
        this.map = map;
        this.difficultyCalculationResult = difficultyCalculationResult;
        this.result = result;
    }
}
