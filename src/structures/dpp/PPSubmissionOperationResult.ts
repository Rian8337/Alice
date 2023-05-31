import { PPSubmissionStatus } from "./PPSubmissionStatus";

/**
 * Represents the result of a pp submission operation.
 */
export interface PPSubmissionOperationResult {
    /**
     * The amount of pp gained from the operation.
     */
    readonly ppGained: number;

    /**
     * The new total pp of the player.
     */
    readonly newTotalPP: number;

    /**
     * The increment towards the player's play count.
     */
    readonly playCountIncrement: number;

    /**
     * The statuses of submissions.
     */
    readonly statuses: PPSubmissionStatus[];
}
