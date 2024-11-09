/**
 * Represents a whitelisted beatmap's difficulty statistics.
 */
export interface WhitelistDifficultyStatistics {
    /**
     * The circle size of the beatmap.
     */
    cs: number;

    /**
     * The approach rate of the beatmap.
     */
    ar: number;

    /**
     * The overall difficulty of the beatmap.
     */
    od: number;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number;

    /**
     * The star rating of the beatmap.
     */
    sr: number;

    /**
     * The BPM of the beatmap.
     */
    bpm: number;
}
