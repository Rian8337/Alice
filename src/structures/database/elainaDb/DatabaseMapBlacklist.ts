import { BaseDocument } from "../BaseDocument";

/**
 * Represents a blacklisted beatmap.
 */
export interface DatabaseMapBlacklist extends BaseDocument {
    /**
     * The ID of the beatmap.
     */
    beatmapID: number;

    /**
     * The reason the beatmap was blacklisted.
     */
    reason: string;
}
