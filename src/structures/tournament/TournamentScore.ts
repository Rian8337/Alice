import { Score } from "@rian8337/osu-droid-utilities";

/**
 * Represents a tournament score.
 */
export interface TournamentScore {
    /**
     * The ScoreV2 value of this tournament score.
     */
    readonly scoreV2: number;

    /**
     * The underlying score.
     */
    readonly score: Score;
}
