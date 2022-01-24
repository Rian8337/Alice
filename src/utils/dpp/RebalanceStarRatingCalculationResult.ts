import { MapInfo } from "@rian8337/osu-base";
import { StarRating as RebalanceStarRating } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class RebalanceStarRatingCalculationResult<
    T extends RebalanceStarRating
    > {
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
