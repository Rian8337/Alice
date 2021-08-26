import { DroidStarRating, MapInfo, OsuStarRating } from "osu-droid";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export interface StarRatingCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo,
    /**
     * The difficulty of the beatmap in osu!droid.
     */
    readonly droid: DroidStarRating,
    /**
     * The difficulty of the beatmap in osu!standard.
     */
    readonly osu: OsuStarRating
};