import { CloneableMapStats } from "./CloneableMapStats";

/**
 * Represents a parameter to alter difficulty calculation result that can be cloned
 * for specific purposes (i.e., passing data between worker threads).
 */
export interface CloneableDifficultyCalculationParameters<
    TFromCalculation extends boolean = boolean
> {
    /**
     * Custom statistics to apply mods, custom speed multiplier, and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics: CloneableMapStats<TFromCalculation>;
}
