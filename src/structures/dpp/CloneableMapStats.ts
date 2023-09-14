import { Optional } from "@alice-structures/utils/Optional";

/**
 * Represents beatmap statistics that can be cloned.
 */
export interface CloneableMapStats<TFromCalculation extends boolean = boolean> {
    /**
     * The enabled modifications.
     */
    mods: Optional<TFromCalculation, string>;

    /**
     * The speed multiplier applied from all modifications.
     */
    speedMultiplier: Optional<TFromCalculation, number>;

    /**
     * Whether or not this map statistics uses forced AR.
     */
    isForceAR: Optional<TFromCalculation, boolean>;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older).
     */
    oldStatistics: Optional<TFromCalculation, boolean>;
}
