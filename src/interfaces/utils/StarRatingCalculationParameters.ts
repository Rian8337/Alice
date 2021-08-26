import { MapStats, Mod } from "osu-droid";

/**
 * Represents a parameter to alter difficulty calculation result.
 */
export interface StarRatingCalculationParameters {
    /**
     * The modifications to calculate.
     */
    mods: Mod[];

    /**
     * Custom statistics to apply custom speed multiplier and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics?: MapStats;
};