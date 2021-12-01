import { BaseDocument } from "../BaseDocument";

/**
 * Represents an information about a player who's being tracked for recent plays.
 */
export interface DatabasePlayerTracking extends BaseDocument {
    /**
     * The UID of the tracked osu!droid account.
     */
    uid: number;
}
