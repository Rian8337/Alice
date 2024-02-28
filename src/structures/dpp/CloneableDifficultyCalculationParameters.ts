import { Optional } from "@alice-structures/utils/Optional";

/**
 * Represents a parameter to alter difficulty calculation result that can be cloned
 * for specific purposes (i.e., passing data between worker threads).
 */
export interface CloneableDifficultyCalculationParameters<
    TFromCalculation extends boolean = boolean,
> {
    /**
     * The mods to calculate for.
     */
    mods: string;

    /**
     * The custom speed multiplier to calculate for.
     */
    customSpeedMultiplier: number;

    /**
     * The circle size to enforce. Defaults to the beatmap's original circle size.
     */
    forceCS: Optional<TFromCalculation, number>;

    /**
     * The approach rate to enforce. Defaults to the beatmap's original approach rate.
     */
    forceAR: Optional<TFromCalculation, number | undefined>;

    /**
     * The overall difficulty to enforce. Defaults to the beatmap's original overall difficulty.
     */
    forceOD: Optional<TFromCalculation, number | undefined>;

    /**
     * The health drain to enforce. Defaults to the beatmap's original health drain.
     */
    forceHP: Optional<TFromCalculation, number | undefined>;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older). Defaults to `false`.
     */
    oldStatistics: Optional<TFromCalculation, boolean>;
}
