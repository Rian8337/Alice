/**
 * Represents a parameter to alter difficulty calculation result that can be cloned
 * for specific purposes (i.e., passing data between worker threads).
 */
export interface CloneableDifficultyCalculationParameters {
    /**
     * Custom statistics to apply mods, custom speed multiplier, and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics?: {
        /**
         * The circle size of the beatmap.
         */
        cs?: number;

        /**
         * The approach rate of the beatmap.
         */
        ar?: number;

        /**
         * The overall difficulty of the beatmap.
         */
        od?: number;

        /**
         * The health drain rate of the beatmap.
         */
        hp?: number;

        /**
         * The enabled modifications.
         */
        mods?: string;

        /**
         * The speed multiplier applied from all modifications.
         */
        speedMultiplier?: number;

        /**
         * Whether or not this map statistics uses forced AR.
         */
        isForceAR?: boolean;

        /**
         * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older).
         */
        oldStatistics?: boolean;
    };
}
