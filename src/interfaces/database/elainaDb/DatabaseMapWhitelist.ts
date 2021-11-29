import { WhitelistDifficultyStatistics } from "@alice-interfaces/dpp/WhitelistDifficultyStatistics";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a whitelisted beatmap.
 */
export interface DatabaseMapWhitelist extends BaseDocument {
    /**
     * The ID of the beatmap.
     */
    mapid: number;

    /**
     * The MD5 hash of the beatmap.
     */
    hashid: string;

    /**
     * The full name of the beatmap.
     */
    mapname: string;

    /**
     * Difficulty statistics for beatmap whitelisting query.
     */
    diffstat: WhitelistDifficultyStatistics;

    /**
     * Whether the ongoing whitelist scan is completed for this beatmap.
     */
    whitelistScanDone?: boolean;
}
