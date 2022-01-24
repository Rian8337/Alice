import { MapInfo } from "@rian8337/osu-base";
import { StarRating } from "@rian8337/osu-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class StarRatingCalculationResult<T extends StarRating> {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo;

    /**
     * The difficulty of the beatmap.
     */
    readonly result: T;

    constructor(map: MapInfo, result: T) {
        this.map = map;
        this.result = result;
    }
}
