import { Optional } from "@alice-structures/utils/Optional";

/**
 * Represents beatmap statistics that can be cloned.
 */
export interface CloneableMapStats<TFromCalculation extends boolean = boolean> {
    /**
     * The circle size that was calculated.
     */
    cs: Optional<TFromCalculation, number>;

    /**
     * The approach rate that was calculated.
     */
    ar: Optional<TFromCalculation, number>;

    /**
     * The overall difficulty that was calculated.
     */
    od: Optional<TFromCalculation, number>;

    /**
     * The health drain rate that was calculated.
     */
    hp: Optional<TFromCalculation, number>;

    /**
     * The enabled modifications.
     */
    mods: Optional<TFromCalculation, string>;

    /**
     * The speed multiplier applied from all modifications.
     */
    speedMultiplier: Optional<TFromCalculation, number>;

    /**
     * Whether this map statistics uses force CS.
     */
    forceCS: Optional<TFromCalculation, boolean>;

    /**
     * Whether this map statistics uses force AR.
     */
    forceAR: Optional<TFromCalculation, boolean>;

    /**
     * Whether this map statistics uses force OD.
     */
    forceOD: Optional<TFromCalculation, boolean>;

    /**
     * Whether this map statistics uses force HP.
     */
    forceHP: Optional<TFromCalculation, boolean>;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older).
     */
    oldStatistics: Optional<TFromCalculation, boolean>;
}
