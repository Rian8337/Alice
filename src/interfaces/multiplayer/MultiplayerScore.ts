/**
 * Represents a score from a player.
 */
export interface MultiplayerScore {
    /**
     * The user ID of the player.
     */
    readonly uid: number;

    /**
     * The name of the player.
     */
    readonly username: string;

    /**
     * The MD5 hash of the beatmap that was played by the player.
     */
    readonly hash: string;

    /**
     * The string of mod combinations received from the client.
     */
    readonly modstring: string;

    /**
     * The score achieved by the player.
     */
    readonly score: number;

    /**
     * The maximum combo achieved by the player.
     */
    readonly maxCombo: number;

    /**
     * The rank achieved by the player.
     */
    readonly rank: string;

    /**
     * The amount of geki achieved by the player.
     */
    readonly geki: number;

    /**
     * The amount of perfect hits (300) achieved by the player.
     */
    readonly perfect: number;

    /**
     * The amount of katu achieved by the player.
     */
    readonly katu: number;

    /**
     * The amount of good hits (100) achieved by the player.
     */
    readonly good: number;

    /**
     * The amount of bad hits (50) achieved by the player.
     */
    readonly bad: number;

    /**
     * The amount of misses achieved by the player.
     */
    readonly miss: number;

    /**
     * The Unix timestamp at which the score was finished, in milliseconds.
     */
    readonly date: number;

    /**
     * The unstable rate achieved by the player.
     */
    readonly unstableRate: number;

    /**
     * Whether this player enables the slider lock option.
     */
    readonly isSliderLock: boolean;

    /**
     * The skipped time when using the skip button, in milliseconds. This is 0 if the player didn't use the skip button.
     *
     * Keep in mind that this value is not affected by speed multiplier.
     */
    readonly skippedTime: number;
}
