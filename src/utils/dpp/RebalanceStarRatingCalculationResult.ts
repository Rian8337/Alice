import { MapInfo, RebalanceStarRating } from "osu-droid";

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
