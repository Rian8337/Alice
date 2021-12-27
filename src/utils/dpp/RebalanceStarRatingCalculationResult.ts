import {
    MapInfo,
    RebalanceDroidStarRating,
    RebalanceOsuStarRating,
} from "osu-droid";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class RebalanceStarRatingCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo;

    /**
     * The difficulty of the beatmap in osu!droid.
     */
    readonly droid: RebalanceDroidStarRating;

    /**
     * The difficulty of the beatmap in osu!standard.
     */
    readonly osu: RebalanceOsuStarRating;

    constructor(
        map: MapInfo,
        droid: RebalanceDroidStarRating,
        osu: RebalanceOsuStarRating
    ) {
        this.map = map;
        this.droid = droid;
        this.osu = osu;
    }
}
