import { MapInfo } from "@rian8337/osu-base";
import { DifficultyCalculator } from "@rian8337/osu-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class DifficultyCalculationResult<T extends DifficultyCalculator> {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo;

    /**
     * The difficulty calculator that calculated the beatmap.
     */
    readonly result: T;

    constructor(map: MapInfo, result: T) {
        this.map = map;
        this.result = result;
    }
}
