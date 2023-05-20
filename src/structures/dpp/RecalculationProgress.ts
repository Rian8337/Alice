import { PPEntry } from "./PPEntry";

/**
 * Contains information about ongoing dpp recalculation.
 */
export interface RecalculationProgress {
    /**
     * The uid that is being calculated.
     */
    uid: number;

    /**
     * The page that is being calculated.
     */
    page: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

    /**
     * The current pp entries that contains scores that have been processed up to this point.
     */
    currentPPEntries: PPEntry[];
}
