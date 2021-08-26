import { MatchPlayerScore } from "./MatchPlayerScore";

/**
 * Represents a round's result in a match.
 */
export interface RoundScore {
    /**
     * The pick that was being played in respect of the score entry.
     */
    pick: string;

    /**
     * The scores that players have achieved.
     */
    scores: MatchPlayerScore[];
};