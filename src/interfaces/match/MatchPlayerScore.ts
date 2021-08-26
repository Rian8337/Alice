/**
 * Represents a player's match score.
 */
export interface MatchPlayerScore {
    /**
     * The name of the player.
     */
    player: string;

    /**
     * The ScoreV1 that was achieved by the player.
     */
    scorev1: number;

    /**
     * The accuracy that was achieved by the player.
     */
    accuracy: number;

    /**
     * The mods that the player was using.
     */
    mods: string;

    /**
     * The amount of misses achieved by the player.
     */
    miss: number;

    /**
     * The ScoreV2 that was achieved by the player.
     */
    scorev2: number;
};