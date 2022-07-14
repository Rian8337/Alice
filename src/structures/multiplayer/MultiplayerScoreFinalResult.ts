import { MultiplayerScore } from "./MultiplayerScore";

/**
 * Represents the final result of a multiplayer score.
 */
export interface MultiplayerScoreFinalResult extends MultiplayerScore {
    /**
     * The grade of the score.
     */
    grade: number;

    /**
     * The reason for score rejection, if the score is rejected.
     */
    reason?: string;
}
