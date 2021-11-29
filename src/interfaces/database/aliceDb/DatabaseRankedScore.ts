import { BaseDocument } from "../BaseDocument";

/**
 * Represents an osu!droid account's ranked score.
 */
export interface DatabaseRankedScore extends BaseDocument {
    /**
     * The UID of the account.
     */
    uid: number;

    /**
     * The username of the account.
     */
    username: string;

    /**
     * The total ranked score of the account.
     */
    score: number;

    /**
     * The play count of the user (how many scores the user have submitted into the ranked score system).
     */
    playc: number;

    /**
     * The current level of the player.
     */
    level: number;

    /**
     * The list of scores that have been submitted.
     * 
     * The first element is the score, the second element
     * is the MD5 hash of the beatmap.
     */
    scorelist: [number, string][];
}