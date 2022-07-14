/**
 * Represents a droid performance points (dpp) entry.
 */
export interface PPEntry {
    /**
     * The MD5 hash of the beatmap.
     */
    hash: string;

    /**
     * The full name of the beatmap.
     */
    title: string;

    /**
     * The droid performance points of the score.
     */
    pp: number;

    /**
     * The maximum combo achieved in the score.
     */
    combo: number;

    /**
     * The modifications that are applied in the score.
     */
    mods: string;

    /**
     * The accuracy achieved in the score.
     */
    accuracy: number;

    /**
     * The amount of misses achieved in the score.
     */
    miss: number;

    /**
     * The ID of the score inside osu!droid game database.
     */
    scoreID: number;

    /**
     * The forced AR used in the score.
     */
    forcedAR?: number;

    /**
     * The custom speed multiplier used in the score.
     */
    speedMultiplier?: number;
}
