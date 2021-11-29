import { MapStats, Mod } from "osu-droid";

/**
 * Represents a parameter to alter difficulty calculation result.
 */
export class StarRatingCalculationParameters {
    /**
     * The modifications to calculate.
     */
    mods: Mod[];

    /**
     * Custom statistics to apply custom speed multiplier and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics?: MapStats;

    /**
     * @param mods The modifications to calculate for.
     * @param customStatistics  Custom statistics to apply custom speed multiplier and force AR as well as NightCore mod penalty for replay version 3 or older.
     */
    constructor(mods: Mod[], customStatistics?: MapStats) {
        this.mods = mods;
        this.customStatistics = customStatistics;
    }
}