import { MapInfo } from "@rian8337/osu-base";
import { std_diff } from "ojsamadroid";

/**
 * Represents a beatmap's old difficulty calculation result.
 */
export class OldDifficultyCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

    /**
     * The difficulty calculator that calculated the beatmap.
     */
    readonly result: std_diff;

    constructor(map: MapInfo<true>, result: std_diff) {
        this.map = map;
        this.result = result;
    }
}
