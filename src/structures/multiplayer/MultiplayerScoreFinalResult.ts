import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { MultiplayerScore } from "./MultiplayerScore";

/**
 * Represents the final result of a multiplayer score.
 */
export interface MultiplayerScoreFinalResult {
    /**
     * The underlying score.
     */
    readonly score: MultiplayerScore | RecentPlay;

    /**
     * The grade of the score.
     */
    grade: number;

    /**
     * The reason for score rejection, if the score is rejected.
     */
    reason?: string;
}
