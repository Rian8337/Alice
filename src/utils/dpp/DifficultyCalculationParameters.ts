import { MapStats } from "@rian8337/osu-base";

/**
 * Represents a parameter to alter difficulty calculation result.
 */
export class DifficultyCalculationParameters {
    /**
     * Custom statistics to apply mods, custom speed multiplier, and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics?: MapStats;

    /**
     * @param customStatistics Custom statistics to apply mods, custom speed multiplier and force AR as well as NightCore mod penalty for replay version 3 or older.
     */
    constructor(customStatistics?: MapStats) {
        this.customStatistics = customStatistics;
    }
}
